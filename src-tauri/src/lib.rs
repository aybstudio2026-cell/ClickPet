use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, Emitter};
use std::sync::{Arc, Mutex};
use std::thread;

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