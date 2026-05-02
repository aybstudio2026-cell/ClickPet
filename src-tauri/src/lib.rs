use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, Emitter};
use std::sync::{Arc, Mutex};
use std::thread;
use std::path::PathBuf;
use std::fs;

#[derive(Clone)]
struct AppState {
    user_pet_id: Arc<Mutex<Option<String>>>,
}

#[tauri::command]
fn show_overlay(app: tauri::AppHandle, user_pet_id: String) {
    if let Some(state) = app.try_state::<AppState>() {
        let mut id = state.user_pet_id.lock().unwrap();
        *id = Some(user_pet_id.clone());
    }

    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.show();
        let _ = overlay.emit("pet-id", user_pet_id);
    } else {
        let url = format!("index.html?window=overlay&pet={}", user_pet_id);
        if let Ok(win) = WebviewWindowBuilder::new(
            &app,
            "overlay",
            WebviewUrl::App(url.into()),
        )
        .title("")
        .inner_size(180.0, 180.0)
        .position(50.0, 50.0)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .build()
        {
            let _ = win.set_ignore_cursor_events(false);
        }
    }
}

#[tauri::command]
fn hide_overlay(app: tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.hide();
    }
}

#[tauri::command]
fn set_user_pet_id(app: tauri::AppHandle, user_pet_id: String) {
    if let Some(state) = app.try_state::<AppState>() {
        let mut id = state.user_pet_id.lock().unwrap();
        *id = Some(user_pet_id.clone());
    }
    if let Some(overlay) = app.get_webview_window("overlay") {
        let _ = overlay.emit("pet-id", user_pet_id);
    }
}

fn start_global_click_listener(app: tauri::AppHandle) {
    thread::spawn(move || {
        rdev::listen(move |event| {
            match event.event_type {
                rdev::EventType::ButtonPress(rdev::Button::Left)
                | rdev::EventType::ButtonPress(rdev::Button::Right) => {
                    if let Some(overlay) = app.get_webview_window("overlay") {
                        if overlay.is_visible().unwrap_or(false) {
                            let _ = overlay.emit("global-click", ());
                        }
                    }
                }
                _ => {}
            }
        })
        .ok();
    });
}

#[tauri::command]
fn emit_to_dashboard(app: tauri::AppHandle, clicks: u64) {
    if let Some(dashboard) = app.get_webview_window("dashboard") {
        let _ = dashboard.emit("click-update", clicks);
    }
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            user_pet_id: Arc::new(Mutex::new(None)),
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            hide_overlay,
            set_user_pet_id,
            emit_to_dashboard,
            close_app,
            check_pet_assets,
            download_pet_assets,
            download_potion_image,
            get_asset_path,
        ])
        .setup(|app| {
            // Tray icon
            use tauri::tray::{TrayIconBuilder, TrayIconEvent};
            use tauri::menu::{MenuBuilder, MenuItemBuilder};

            let show = MenuItemBuilder::with_id("show", "Mostrar dashboard").build(app)?;
            let toggle = MenuItemBuilder::with_id("toggle", "Mostrar/Ocultar mascota").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Salir").build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&show, &toggle, &quit])
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("dashboard") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "toggle" => {
                        if let Some(overlay) = app.get_webview_window("overlay") {
                            if overlay.is_visible().unwrap_or(false) {
                                let _ = overlay.hide();
                            } else {
                                let _ = overlay.show();
                            }
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::DoubleClick { .. } = event {
                        if let Some(w) = tray.app_handle().get_webview_window("dashboard") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            start_global_click_listener(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_assets_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path().app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("assets")
}

#[tauri::command]
async fn check_pet_assets(app: tauri::AppHandle, slug: String) -> bool {
    let pet_dir = get_assets_dir(&app).join(&slug);
    if !pet_dir.exists() { return false; }
    
    // Verificar que tenga al menos los archivos del stage 1
    let required = vec![
        "stage1_idle.png",
        "stage1_click.png", 
        "stage1_rapid.png",
        "stage1_sleep.png",
        "stage1_potion.png",
    ];
    
    required.iter().all(|f| pet_dir.join(f).exists())
}

#[tauri::command]
async fn download_pet_assets(
    app: tauri::AppHandle,
    slug: String,
    base_url: String,
) -> Result<(), String> {
    let assets_dir = get_assets_dir(&app);
    let pet_dir = assets_dir.join(&slug);
    
    // Crear directorio si no existe
    fs::create_dir_all(&pet_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;

    let stages = 5;
    let animations = vec!["idle", "click", "rapid", "sleep", "potion"];
    
    let client = reqwest::Client::new();
    
    for stage in 1..=stages {
        for anim in &animations {
            let filename = format!("stage{}_{}.png", stage, anim);
            let file_path = pet_dir.join(&filename);
            
            // Si ya existe, saltar
            if file_path.exists() { continue; }
            
            let url = format!("{}/{}", base_url.trim_end_matches('/'), filename);
            
            match client.get(&url).send().await {
                Ok(response) if response.status().is_success() => {
                    let bytes = response.bytes().await
                        .map_err(|e| format!("Error leyendo bytes: {}", e))?;
                    fs::write(&file_path, &bytes)
                        .map_err(|e| format!("Error escribiendo archivo: {}", e))?;
                }
                Ok(response) => {
                    // Archivo no existe en servidor, crear placeholder vacío
                    // para no volver a intentar descargarlo
                    eprintln!("Asset no encontrado: {} ({})", url, response.status());
                }
                Err(e) => {
                    eprintln!("Error descargando {}: {}", url, e);
                }
            }
        }
    }
    
    Ok(())
}

#[tauri::command]
async fn download_potion_image(
    app: tauri::AppHandle,
    slug: String,
    url: String,
) -> Result<String, String> {
    let potions_dir = get_assets_dir(&app).join("potions");
    fs::create_dir_all(&potions_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;
    
    let filename = format!("{}.png", slug);
    let file_path = potions_dir.join(&filename);
    
    if file_path.exists() {
        return Ok(file_path.to_string_lossy().to_string());
    }
    
    let client = reqwest::Client::new();
    let response = client.get(&url).send().await
        .map_err(|e| format!("Error en request: {}", e))?;
    
    if response.status().is_success() {
        let bytes = response.bytes().await
            .map_err(|e| format!("Error leyendo bytes: {}", e))?;
        fs::write(&file_path, &bytes)
            .map_err(|e| format!("Error escribiendo: {}", e))?;
    }
    
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_asset_path(app: tauri::AppHandle, slug: String, stage: u8, animation: String) -> String {
    let path = get_assets_dir(&app)
        .join(&slug)
        .join(format!("stage{}_{}.png", stage, animation));
    
    if path.exists() {
        // Convertir a URL que WebView puede leer
        format!("https://asset.localhost/{}/{}/stage{}_{}.png", slug, slug, stage, animation)
    } else {
        String::new()
    }
}