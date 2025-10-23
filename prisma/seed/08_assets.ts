// seed/08_assets.ts
import { PrismaClient } from '@prisma/client';
// ---- DATASET ----
const variantAssetsData = [
  // ========= variant_id: 1,2,3 cùng ảnh =========
  {
    variant_id: 1,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/c706daf4dc4c4bc8bd3f8138952a79d7_9366/adidas_Adicolor_Jacquard_Jersey_Black_JW5876_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 1,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f15c032c8d71423d94cc77437b7c874b_9366/adidas_Adicolor_Jacquard_Jersey_Black_JW5876_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 2,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/c706daf4dc4c4bc8bd3f8138952a79d7_9366/adidas_Adicolor_Jacquard_Jersey_Black_JW5876_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 2,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f15c032c8d71423d94cc77437b7c874b_9366/adidas_Adicolor_Jacquard_Jersey_Black_JW5876_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 3,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/c706daf4dc4c4bc8bd3f8138952a79d7_9366/adidas_Adicolor_Jacquard_Jersey_Black_JW5876_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 3,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f15c032c8d71423d94cc77437b7c874b_9366/adidas_Adicolor_Jacquard_Jersey_Black_JW5876_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 4,5,6,7 =========
  {
    variant_id: 4,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a0beff51e6b047508a93af2ac547501b_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 4,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/51150350e02b48aabecb83f020169894_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM3_hover.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 5,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a0beff51e6b047508a93af2ac547501b_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 5,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/51150350e02b48aabecb83f020169894_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM3_hover.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 6,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a0beff51e6b047508a93af2ac547501b_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 6,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/51150350e02b48aabecb83f020169894_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM3_hover.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 7,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a0beff51e6b047508a93af2ac547501b_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 7,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/51150350e02b48aabecb83f020169894_9366/Originals_Twistknit_Trefoil_Polo_Shirt_White_JH3861_HM3_hover.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 8,9,10 =========
  {
    variant_id: 8,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/638f1ea3744c4f7fb54d12c0624e4abe_9366/Twistweave_Pinstripe_Ankle_Pants_Black_JG1342_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 8,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/7736cd3d15ec48489d0c7c86b6e0d025_9366/Twistweave_Pinstripe_Ankle_Pants_Black_JG1342_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 9,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/638f1ea3744c4f7fb54d12c0624e4abe_9366/Twistweave_Pinstripe_Ankle_Pants_Black_JG1342_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 9,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/7736cd3d15ec48489d0c7c86b6e0d025_9366/Twistweave_Pinstripe_Ankle_Pants_Black_JG1342_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 10,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/638f1ea3744c4f7fb54d12c0624e4abe_9366/Twistweave_Pinstripe_Ankle_Pants_Black_JG1342_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 10,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/7736cd3d15ec48489d0c7c86b6e0d025_9366/Twistweave_Pinstripe_Ankle_Pants_Black_JG1342_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 11,12,13,14=========
  {
    variant_id: 11,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f7d90e05d64e4c0ab353af98c2f611e2_9366/Quan_Short_Z.N.E._DJen_JE7540_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 11,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/db78182914754bc1983f5639d5ad6189_9366/Quan_Short_Z.N.E._DJen_JE7540_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 12,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f7d90e05d64e4c0ab353af98c2f611e2_9366/Quan_Short_Z.N.E._DJen_JE7540_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 12,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/db78182914754bc1983f5639d5ad6189_9366/Quan_Short_Z.N.E._DJen_JE7540_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 13,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f7d90e05d64e4c0ab353af98c2f611e2_9366/Quan_Short_Z.N.E._DJen_JE7540_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 13,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/db78182914754bc1983f5639d5ad6189_9366/Quan_Short_Z.N.E._DJen_JE7540_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 14,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f7d90e05d64e4c0ab353af98c2f611e2_9366/Quan_Short_Z.N.E._DJen_JE7540_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 14,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/db78182914754bc1983f5639d5ad6189_9366/Quan_Short_Z.N.E._DJen_JE7540_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 15,16,17 =========
  {
    variant_id: 15,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d24bf1e26cd8455fad4f37e42c162d7a_9366/Essentials_3-Stripes_Cotton_Tee_Black_JD0846_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 15,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/6a95f294fe2f445584f3e1251e6103be_9366/Essentials_3-Stripes_Cotton_Tee_Black_JD0846_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 16,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d24bf1e26cd8455fad4f37e42c162d7a_9366/Essentials_3-Stripes_Cotton_Tee_Black_JD0846_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 16,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/6a95f294fe2f445584f3e1251e6103be_9366/Essentials_3-Stripes_Cotton_Tee_Black_JD0846_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 17,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d24bf1e26cd8455fad4f37e42c162d7a_9366/Essentials_3-Stripes_Cotton_Tee_Black_JD0846_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 17,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/6a95f294fe2f445584f3e1251e6103be_9366/Essentials_3-Stripes_Cotton_Tee_Black_JD0846_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 18,19,20 =========
  {
    variant_id: 18,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/5eee1c2e006a4e34abf377cf44eb3d1f_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 18,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/ce7c3978bef24fad9c455a9b806dbe17_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 19,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/5eee1c2e006a4e34abf377cf44eb3d1f_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 19,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/ce7c3978bef24fad9c455a9b806dbe17_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 20,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/5eee1c2e006a4e34abf377cf44eb3d1f_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 20,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/ce7c3978bef24fad9c455a9b806dbe17_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 21,22,23 =========
  {
    variant_id: 21,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/bf7a8de1091e43ebafa59a2a57acb9ec_9366/adidas_All_Me_Rib_7-8_Leggings_Purple_JW7591_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 21,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/41116caf55394a95a3e0ef0bdb8937af_9366/adidas_All_Me_Rib_7-8_Leggings_Purple_JW7591_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 22,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/5eee1c2e006a4e34abf377cf44eb3d1f_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 22,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/ce7c3978bef24fad9c455a9b806dbe17_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 23,
    url: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/5eee1c2e006a4e34abf377cf44eb3d1f_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 23,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/ce7c3978bef24fad9c455a9b806dbe17_9366/Essentials_Small_Logo_Cotton_Lifestyle_Tank_Top_White_JD0545_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 24,25,26 =========
  {
    variant_id: 24,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f1e8a059d13a45438b66b01061657ab4_9366/ADIDAS_ORIGINALS_GFX_SKIRT_Blue_KC6274_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 24,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d0af14ba4c9c473f8fb615337dd1dc31_9366/ADIDAS_ORIGINALS_GFX_SKIRT_Blue_KC6274_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 25,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f1e8a059d13a45438b66b01061657ab4_9366/ADIDAS_ORIGINALS_GFX_SKIRT_Blue_KC6274_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 25,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d0af14ba4c9c473f8fb615337dd1dc31_9366/ADIDAS_ORIGINALS_GFX_SKIRT_Blue_KC6274_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 26,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f1e8a059d13a45438b66b01061657ab4_9366/ADIDAS_ORIGINALS_GFX_SKIRT_Blue_KC6274_21_model.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 26,
    url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/d0af14ba4c9c473f8fb615337dd1dc31_9366/ADIDAS_ORIGINALS_GFX_SKIRT_Blue_KC6274_23_hover_model.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 27,28,29 =========
  {
    variant_id: 27,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/835c0849-7dae-4268-99a0-1ad606e8970f/AS+M+NK+DF+TEE+RUN+ENERGY+SP25.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 27,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e00729a5-1aa4-4125-aa2e-605d748dde13/AS+M+NK+DF+TEE+RUN+ENERGY+SP25.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 28,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/835c0849-7dae-4268-99a0-1ad606e8970f/AS+M+NK+DF+TEE+RUN+ENERGY+SP25.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 28,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e00729a5-1aa4-4125-aa2e-605d748dde13/AS+M+NK+DF+TEE+RUN+ENERGY+SP25.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 29,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/835c0849-7dae-4268-99a0-1ad606e8970f/AS+M+NK+DF+TEE+RUN+ENERGY+SP25.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 29,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e00729a5-1aa4-4125-aa2e-605d748dde13/AS+M+NK+DF+TEE+RUN+ENERGY+SP25.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 30,31,32,33 =========
  {
    variant_id: 30,
    url: 'https://img1.theiconic.com.au/z2VDmwcUqlBO0C7lNTm89OZvXbM=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4233-7403752-1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 30,
    url: 'https://img1.theiconic.com.au/LRg7BgDfmlAlafr0X2tmblTXhRU=/fit-in/406x512/filters:fill(ffffff):quality(90):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4236-7403752-2.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 31,
    url: 'https://img1.theiconic.com.au/z2VDmwcUqlBO0C7lNTm89OZvXbM=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4233-7403752-1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 31,
    url: 'https://img1.theiconic.com.au/LRg7BgDfmlAlafr0X2tmblTXhRU=/fit-in/406x512/filters:fill(ffffff):quality(90):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4236-7403752-2.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 32,
    url: 'https://img1.theiconic.com.au/z2VDmwcUqlBO0C7lNTm89OZvXbM=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4233-7403752-1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 32,
    url: 'https://img1.theiconic.com.au/LRg7BgDfmlAlafr0X2tmblTXhRU=/fit-in/406x512/filters:fill(ffffff):quality(90):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4236-7403752-2.jpg',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 33,
    url: 'https://img1.theiconic.com.au/z2VDmwcUqlBO0C7lNTm89OZvXbM=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4233-7403752-1.jpg',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 33,
    url: 'https://img1.theiconic.com.au/LRg7BgDfmlAlafr0X2tmblTXhRU=/fit-in/406x512/filters:fill(ffffff):quality(90):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-4236-7403752-2.jpg',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 34,35,36 =========
  {
    variant_id: 34,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/0400f573-486e-4e41-b57c-3ea823db2384/AS+M+NK+UV+RPL+STRIDE+JACKET.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 34,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cf410fac-c87c-4e8a-a361-49a4224efc34/AS+M+NK+UV+RPL+STRIDE+JACKET.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 35,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/0400f573-486e-4e41-b57c-3ea823db2384/AS+M+NK+UV+RPL+STRIDE+JACKET.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 35,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cf410fac-c87c-4e8a-a361-49a4224efc34/AS+M+NK+UV+RPL+STRIDE+JACKET.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 36,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/0400f573-486e-4e41-b57c-3ea823db2384/AS+M+NK+UV+RPL+STRIDE+JACKET.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 36,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cf410fac-c87c-4e8a-a361-49a4224efc34/AS+M+NK+UV+RPL+STRIDE+JACKET.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 37,38,39,40 =========
  {
    variant_id: 37,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/7e9daeec-80b2-4512-8d32-33aee49aeef3/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 37,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cbef7b11-1938-43db-a6fc-96189684df89/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 38,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/7e9daeec-80b2-4512-8d32-33aee49aeef3/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 38,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cbef7b11-1938-43db-a6fc-96189684df89/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 39,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/7e9daeec-80b2-4512-8d32-33aee49aeef3/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 39,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cbef7b11-1938-43db-a6fc-96189684df89/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 40,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/7e9daeec-80b2-4512-8d32-33aee49aeef3/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 40,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/cbef7b11-1938-43db-a6fc-96189684df89/AS++M+NK+DF+VICTORY+PANT.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 41,42,43 =========
  {
    variant_id: 41,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/85395283-9a82-45e5-8cbe-4bfe720b89fa/AS+M+NK+DF+CHALLENGER+5BF+SHO.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 41,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/de566552-c1ef-49f3-9579-6f01d4241fb3/AS+M+NK+DF+CHALLENGER+5BF+SHO.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 42,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/85395283-9a82-45e5-8cbe-4bfe720b89fa/AS+M+NK+DF+CHALLENGER+5BF+SHO.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 42,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/de566552-c1ef-49f3-9579-6f01d4241fb3/AS+M+NK+DF+CHALLENGER+5BF+SHO.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 43,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/85395283-9a82-45e5-8cbe-4bfe720b89fa/AS+M+NK+DF+CHALLENGER+5BF+SHO.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 43,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/de566552-c1ef-49f3-9579-6f01d4241fb3/AS+M+NK+DF+CHALLENGER+5BF+SHO.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 44,45,46 =========
  {
    variant_id: 44,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/3cc5389e-26b8-455e-9574-d96c157f58ab/U+NK+TEE+CALLING+BASKETBALL+QS.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 44,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/c7c8e6db-65db-413e-b773-bf7b73dae8d4/U+NK+TEE+CALLING+BASKETBALL+QS.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 45,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/3cc5389e-26b8-455e-9574-d96c157f58ab/U+NK+TEE+CALLING+BASKETBALL+QS.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 45,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/c7c8e6db-65db-413e-b773-bf7b73dae8d4/U+NK+TEE+CALLING+BASKETBALL+QS.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 46,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/3cc5389e-26b8-455e-9574-d96c157f58ab/U+NK+TEE+CALLING+BASKETBALL+QS.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 46,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/c7c8e6db-65db-413e-b773-bf7b73dae8d4/U+NK+TEE+CALLING+BASKETBALL+QS.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 47,48,49 =========
  {
    variant_id: 47,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/f52d5b90-7803-471e-8c2e-3ab03ef844d2/AS+W+NSW+NK+WR+WVN+LTWT+HDED.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 47,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/b4977e8e-6f85-496b-bcd7-489fcedee6ae/AS+W+NSW+NK+WR+WVN+LTWT+HDED.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 48,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/f52d5b90-7803-471e-8c2e-3ab03ef844d2/AS+W+NSW+NK+WR+WVN+LTWT+HDED.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 48,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/b4977e8e-6f85-496b-bcd7-489fcedee6ae/AS+W+NSW+NK+WR+WVN+LTWT+HDED.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 49,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/f52d5b90-7803-471e-8c2e-3ab03ef844d2/AS+W+NSW+NK+WR+WVN+LTWT+HDED.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 49,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/b4977e8e-6f85-496b-bcd7-489fcedee6ae/AS+W+NSW+NK+WR+WVN+LTWT+HDED.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 50,51,52 =========
  {
    variant_id: 50,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/408aadbb-f7a9-4629-af97-169ea4c8c605/AS+W+NKCT+DF+ADVTG+ACE+SKT+HR.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 50,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/ed187cc1-bfc5-4210-aa52-3e7a588741b6/AS+W+NKCT+DF+ADVTG+ACE+SKT+HR.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 51,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/408aadbb-f7a9-4629-af97-169ea4c8c605/AS+W+NKCT+DF+ADVTG+ACE+SKT+HR.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 51,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/ed187cc1-bfc5-4210-aa52-3e7a588741b6/AS+W+NKCT+DF+ADVTG+ACE+SKT+HR.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 52,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/408aadbb-f7a9-4629-af97-169ea4c8c605/AS+W+NKCT+DF+ADVTG+ACE+SKT+HR.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 52,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/ed187cc1-bfc5-4210-aa52-3e7a588741b6/AS+W+NKCT+DF+ADVTG+ACE+SKT+HR.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 53,54,55 =========
  {
    variant_id: 53,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/747244cc-e917-4ef2-b0f3-64b3800b1956/AS+W+NK+24.7+DF+HR+WD+LEG+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 53,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/bb1fac83-fa67-4cc0-9574-f5f37047e64e/AS+W+NK+24.7+DF+HR+WD+LEG+PANT.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 54,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/747244cc-e917-4ef2-b0f3-64b3800b1956/AS+W+NK+24.7+DF+HR+WD+LEG+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 54,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/bb1fac83-fa67-4cc0-9574-f5f37047e64e/AS+W+NK+24.7+DF+HR+WD+LEG+PANT.png',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 55,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/747244cc-e917-4ef2-b0f3-64b3800b1956/AS+W+NK+24.7+DF+HR+WD+LEG+PANT.png',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 55,
    url: 'https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/bb1fac83-fa67-4cc0-9574-f5f37047e64e/AS+W+NK+24.7+DF+HR+WD+LEG+PANT.png',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 56,57,58 =========
  {
    variant_id: 56,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481004/item/vngoods_31_481004_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 56,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481004/sub/vngoods_481004_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 57,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481004/item/vngoods_31_481004_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 57,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481004/sub/vngoods_481004_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 58,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481004/item/vngoods_31_481004_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 58,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481004/sub/vngoods_481004_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 59,60,61,62 =========
  {
    variant_id: 59,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/item/vngoods_17_481227_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 59,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/sub/vngoods_481227_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 60,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/item/vngoods_17_481227_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 60,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/sub/vngoods_481227_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 61,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/item/vngoods_17_481227_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 61,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/sub/vngoods_481227_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 62,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/item/vngoods_17_481227_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 62,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481227/sub/vngoods_481227_sub1_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 63,64,65 =========
  {
    variant_id: 63,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470542/item/vngoods_08_470542_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 63,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470542/sub/goods_470542_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 64,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470542/item/vngoods_08_470542_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 64,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470542/sub/goods_470542_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 65,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470542/item/vngoods_08_470542_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 65,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/470542/sub/goods_470542_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 66,67,68 =========
  {
    variant_id: 66,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/467797/item/vngoods_34_467797_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 66,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/467797/sub/goods_467797_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 67,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/467797/item/vngoods_34_467797_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 67,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/467797/sub/goods_467797_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 68,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/467797/item/vngoods_34_467797_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 68,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/467797/sub/goods_467797_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 69,70,71 =========
  {
    variant_id: 69,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480054/item/vngoods_09_480054_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 69,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480054/sub/vngoods_480054_sub7_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 70,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480054/item/vngoods_09_480054_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 70,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480054/sub/vngoods_480054_sub7_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 71,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480054/item/vngoods_09_480054_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 71,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480054/sub/vngoods_480054_sub7_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 72,73,74 =========
  {
    variant_id: 72,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/479603/item/vngoods_69_479603_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 72,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/479603/sub/vngoods_479603_sub7_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 73,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/479603/item/vngoods_69_479603_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 73,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/479603/sub/vngoods_479603_sub7_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 74,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/479603/item/vngoods_69_479603_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 74,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/479603/sub/vngoods_479603_sub7_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ========= variant_id: 75,76,77 =========
  {
    variant_id: 75,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477333/item/vngoods_66_477333_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 75,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/477333/sub/goods_477333_sub15_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 76,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477333/item/vngoods_66_477333_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 76,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/477333/sub/goods_477333_sub15_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 77,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477333/item/vngoods_66_477333_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 77,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/477333/sub/goods_477333_sub15_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },

  // ======== variant_id: 78,79,80 =========
  {
    variant_id: 78,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/473765/item/vngoods_11_473765_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 78,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/473765/sub/goods_473765_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 79,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/473765/item/vngoods_11_473765_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 79,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/473765/sub/goods_473765_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
  {
    variant_id: 80,
    url: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/473765/item/vngoods_11_473765_3x4.jpg?width=369',
    type: 'image',
    is_primary: true,
  },
  {
    variant_id: 80,
    url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/473765/sub/goods_473765_sub14_3x4.jpg?width=369',
    type: 'image',
    is_primary: false,
  },
];

export async function seedVariantAssets(prisma: PrismaClient) {
  console.log('🖼️  Seeding variant_assets (manual list)…');
  await prisma.variant_assets.createMany({
    data: variantAssetsData,
    skipDuplicates: true, // tránh lỗi unique (variant_id, url) nếu chạy lại
  });
  console.log(`✅ Done: inserted ${variantAssetsData.length} rows into variant_assets.`);
}
