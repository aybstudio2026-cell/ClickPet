export interface Pet {
  id: string
  name: string
  slug: string
  is_free: boolean
  price: number
  description: string
  created_at: string
}

export interface PetStage {
  id: string
  pet_id: string
  stage_number: number
  stage_name: string
  clicks_required: number
  sprite_sheet_url: string | null
}

export interface UserPet {
  id: string
  user_id: string
  pet_id: string
  total_clicks: number
  current_stage: number
  adopted_at: string
  last_active_at: string
}

export interface PotionInventory {
  id: string
  user_id: string
  potion_id: string
  quantity: number
}

export interface Profile {
  id: string
  email: string
  display_name: string
  balance: number
}