// src/seed/site-contents-chunking.seed.ts
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// ========== CHUNKING WITH OVERLAP ==========
/**
 * Thầy bạn nói về "overlap chunking" hoặc "sliding window chunking"
 * - Chunk 1: [0...1000]
 * - Chunk 2: [800...1800] ← 200 chars overlap
 * - Chunk 3: [1600...2600] ← 200 chars overlap
 *
 * Lợi ích:
 * - Tránh mất context giữa các chunk
 * - Semantic search tốt hơn
 * - Câu trả lời liền mạch hơn
 */

interface ChunkConfig {
  chunkSize: number; // Kích thước mỗi chunk (characters)
  overlapSize: number; // Độ chồng lấn giữa các chunk
  minChunkSize: number; // Chunk tối thiểu (tránh chunk quá nhỏ)
}

const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 1000, // 1000 ký tự/chunk
  overlapSize: 200, // Overlap 200 ký tự (20%)
  minChunkSize: 200, // Chunk tối thiểu 200 ký tự
};

/**
 * Chia text thành chunks với overlap
 */
function chunkTextWithOverlap(text: string, config: ChunkConfig = DEFAULT_CHUNK_CONFIG): string[] {
  const { chunkSize, overlapSize, minChunkSize } = config;

  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Lấy chunk
    const endIndex = startIndex + chunkSize;

    // Nếu đến cuối text
    if (endIndex >= text.length) {
      const lastChunk = text.slice(startIndex);
      if (lastChunk.length >= minChunkSize) {
        chunks.push(lastChunk);
      } else if (chunks.length > 0) {
        // Merge với chunk trước nếu quá nhỏ
        chunks[chunks.length - 1] += ' ' + lastChunk;
      } else {
        chunks.push(lastChunk);
      }
      break;
    }

    // Tìm điểm ngắt tốt (dấu câu, space)
    const breakChars = ['. ', '! ', '? ', '\n', '; '];
    let bestBreak = endIndex;

    for (let i = endIndex; i > endIndex - 100 && i > startIndex; i--) {
      const char2 = text.slice(i, i + 2);
      if (breakChars.includes(char2)) {
        bestBreak = i + 2;
        break;
      }
      if (text[i] === ' ') {
        bestBreak = i + 1;
      }
    }

    chunks.push(text.slice(startIndex, bestBreak).trim());

    // Move to next chunk với overlap
    startIndex = bestBreak - overlapSize;
  }

  return chunks;
}

// ========== ENHANCED SITE CONTENTS DATA ==========
const siteContentsData = [
  // FAQ - SHIPPING
  {
    slug: 'faq-shipping-time',
    title: 'Thời gian giao hàng',
    content: `**Thời gian giao hàng tiêu chuẩn:**

**Nội thành Hà Nội và TP.HCM:**
- Giao hàng nhanh: 1-2 ngày làm việc
- Giao hàng tiêu chuẩn: 2-3 ngày làm việc (miễn phí với đơn ≥ 1.000.000đ)

**Các tỉnh thành khác:**
- Miền Bắc (Hải Phòng, Quảng Ninh, Thái Nguyên...): 2-3 ngày
- Miền Trung (Đà Nẵng, Huế, Quy Nhơn...): 3-4 ngày  
- Miền Nam (Cần Thơ, Vũng Tàu, Đà Lạt...): 3-5 ngày
- Vùng xa, miền núi: 5-7 ngày

**Lưu ý:**
- Thời gian tính từ khi đơn hàng được xác nhận và xuất kho
- Không tính ngày lễ, Tết, Chủ Nhật
- Đơn hàng sau 16h được xử lý vào ngày hôm sau
- Kiểm tra tracking code qua tin nhắn SMS hoặc email`,
    content_type: 'FAQ',
    tags: ['giao-hang', 'shipping', 'thoi-gian', 'delivery'],
    status: true,
  },

  // FAQ - PAYMENT
  {
    slug: 'faq-payment-methods',
    title: 'Phương thức thanh toán',
    content: `**Các phương thức thanh toán được chấp nhận:**

**1. Thanh toán khi nhận hàng (COD)**
- Áp dụng toàn quốc
- Kiểm tra hàng trước khi thanh toán
- Phí COD: 0đ cho đơn dưới 2 triệu, 20.000đ cho đơn từ 2 triệu trở lên

**2. Chuyển khoản ngân hàng**
- Techcombank: 19036512345678 - NGUYEN VAN A
- VCB: 0123456789 - NGUYEN VAN A
- MB Bank: 9876543210 - NGUYEN VAN A
- Nội dung: SDT_HOTEN (VD: 0912345678_NGUYENVANA)

**3. Thẻ tín dụng/ghi nợ (ATM)**
- Visa, Mastercard, JCB
- Thẻ nội địa: Napas
- Thanh toán qua cổng VNPay - bảo mật SSL 256-bit

**4. Ví điện tử**
- MoMo: Quét QR hoặc liên kết ví
- ZaloPay: Thanh toán nhanh trong 30 giây
- VNPay: Ưu đãi giảm 50.000đ cho đơn đầu
- ShopeePay: Cashback 5%

**5. Trả góp 0%**
- Áp dụng cho đơn hàng từ 3.000.000đ
- Thẻ tín dụng: Home Credit, FE Credit, Kredivo
- Kỳ hạn: 3, 6, 9, 12 tháng`,
    content_type: 'FAQ',
    tags: ['thanh-toan', 'payment', 'phuong-thuc', 'cod', 'chuyen-khoan'],
    status: true,
  },

  // FAQ - RETURN POLICY
  {
    slug: 'faq-return-policy',
    title: 'Chính sách đổi trả hàng',
    content: `**Điều kiện đổi/trả hàng:**

**Trong vòng 30 ngày kể từ ngày mua:**
1. Sản phẩm còn nguyên tem mác, nhãn hiệu
2. Chưa qua sử dụng, giặt, không có mùi lạ
3. Còn đầy đủ phụ kiện (túi, hộp đựng nếu có)
4. Có hóa đơn mua hàng (giấy hoặc điện tử)

**Trường hợp được đổi/trả:**
- Sản phẩm bị lỗi từ nhà sản xuất (rách, bung chỉ, phai màu bất thường)
- Giao sai size, sai màu, sai sản phẩm
- Không vừa size (đổi size khác)
- Không hài lòng về sản phẩm (trong 7 ngày đầu)

**Chi phí đổi/trả:**
- **MIỄN PHÍ** nếu lỗi từ shop (sai hàng, lỗi sản xuất)
- **Khách hàng chịu phí ship** nếu đổi size/màu: 50.000đ (2 chiều)
- **Hoàn tiền** trong vòng 3-5 ngày làm việc (qua tài khoản/ví)

**Cách thức đổi/trả:**
1. Liên hệ hotline: 1900-xxxx hoặc Zalo: 0912-345-678
2. Cung cấp: Mã đơn hàng + Lý do đổi/trả + Ảnh sản phẩm
3. Gửi hàng về kho hoặc đến cửa hàng trực tiếp
4. Nhận hàng mới hoặc hoàn tiền

**Địa chỉ đổi/trả hàng:**
- HCM: 11 Nguyễn Đình Chiểu, phường Đa Kao, Quận 1, TP. Hồ Chí Minh
- HN: Số 122 đường Hoàng Quốc Việt, phường Nghĩa Đô, quận Cầu Giấy, Hà Nộii`,
    content_type: 'FAQ',
    tags: ['doi-tra', 'return', 'exchange', 'chinh-sach'],
    status: true,
  },

  // FAQ - WARRANTY
  {
    slug: 'faq-warranty',
    title: 'Chính sách bảo hành',
    content: `**Bảo hành 6 tháng cho lỗi sản xuất:**

**Các lỗi được bảo hành:**
1. Đường may bung, chỉ tuột
2. Khóa kéo hỏng không do tác động bên ngoài
3. Phai màu bất thường (không do giặt sai cách)
4. Vải bị lỗi dệt, lỗ thủng không do sử dụng
5. Nút bấm bật, cúc áo bung

**Không bảo hành cho:**
- Rách, hỏng do va chạm, móc, kéo mạnh
- Phai màu do phơi nắng, giặt với nước nóng/tẩy trắng
- Co rút do giặt sai nhiệt độ
- Mốc, ố vàng do bảo quản không đúng cách
- Hư hỏng do sửa chữa bên ngoài

**Quy trình bảo hành:**
1. Mang sản phẩm + hóa đơn đến cửa hàng
2. Nhân viên kiểm tra, xác định lỗi
3. Nếu thuộc diện bảo hành: Sửa chữa hoặc đổi mới
4. Thời gian xử lý: 5-7 ngày làm việc
5. Miễn phí hoàn toàn

**Điều kiện bảo hành:**
- Còn trong thời hạn 6 tháng
- Có hóa đơn mua hàng (giấy hoặc email)
- Không thuộc trường hợp loại trừ

**Liên hệ bảo hành:**
- Hotline: 1900-xxxx (8:00 - 22:00)
- Email: clothingecom8@gmail.com
- Chat: Fanpage Facebook / Website`,
    content_type: 'FAQ',
    tags: ['bao-hanh', 'warranty', 'loi-san-xuat', 'quality'],
    status: true,
  },

  // GUIDE - SIZE
  {
    slug: 'guide-size-selection',
    title: 'Hướng dẫn chọn size chi tiết',
    content: `**Hướng dẫn chọn size chính xác:**

**Bước 1: Đo số đo cơ thể**

**Dụng cụ:** Thước dây mềm (thước may)

**Cách đo:**
1. **Vòng ngực:** Đo qua điểm cao nhất của ngực, thước nằm ngang song song với mặt đất
2. **Vòng eo:** Đo qua phần nhỏ nhất của eo (thường ngang rốn)
3. **Vòng hông:** Đo qua phần to nhất của hông/mông
4. **Chiều cao:** Đo từ đỉnh đầu đến gót chân (đứng thẳng, không mang giày)
5. **Cân nặng:** Cân vào buổi sáng, chưa ăn sáng (kết quả chính xác nhất)

**Lưu ý khi đo:**
- Đo sát cơ thể nhưng không siết chặt
- Đo vào buổi chiều (cơ thể hơi phù so với sáng)
- Mặc đồ lót mỏng, không mặc áo dày
- Đo 2-3 lần để kiểm tra độ chính xác

---

## **Bước 2: So sánh với bảng size theo thương hiệu**

---

# **👕 Adidas – Size Nam**

## **Áo (T-shirt & Polo)**
- **Size S:** Ngực 87cm, Eo 75cm, Hông 86cm, Dài 68cm  
- **Size M:** Ngực 93cm, Eo 81cm, Hông 92cm, Dài 71cm  
- **Size L:** Ngực 101cm, Eo 89cm, Hông 100cm, Dài 74cm  
- **Size XL:** Ngực 109cm, Eo 97cm, Hông 108cm, Dài 76cm  

## **Quần**
- **XS:** Eo 71cm, Hông 82cm, Dài 96cm  
- **S:** Eo 75cm, Hông 86cm, Dài 98cm  
- **M:** Eo 79cm, Hông 90cm, Dài 100cm  
- **L:** Eo 83cm, Hông 94cm, Dài 102cm  
- **XL:** Eo 87cm, Hông 98cm, Dài 104cm  

---

# **👕 Nike – Size Nam**

## **Áo (T-shirt & Polo)**
- **Size S:** Ngực 88cm, Eo 76cm, Hông 87cm, Dài 69cm  
- **Size M:** Ngực 94cm, Eo 82cm, Hông 93cm, Dài 72cm  
- **Size L:** Ngực 102cm, Eo 90cm, Hông 101cm, Dài 75cm  
- **Size XL:** Ngực 110cm, Eo 98cm, Hông 109cm, Dài 78cm  

## **Quần**
- **XS:** Eo 72cm, Hông 83cm, Dài 95cm  
- **S:** Eo 76cm, Hông 87cm, Dài 97cm  
- **M:** Eo 80cm, Hông 91cm, Dài 99cm  
- **L:** Eo 84cm, Hông 95cm, Dài 101cm  
- **XL:** Eo 88cm, Hông 99cm, Dài 103cm  

---

# **👕 Uniqlo – Size Nam**

## **Áo (T-shirt & Polo)**
- **Size S:** Ngực 89cm, Eo 77cm, Hông 88cm, Dài 70cm  
- **Size M:** Ngực 95cm, Eo 83cm, Hông 94cm, Dài 73cm  
- **Size L:** Ngực 103cm, Eo 91cm, Hông 102cm, Dài 76cm  
- **Size XL:** Ngực 111cm, Eo 99cm, Hông 110cm, Dài 79cm  

## **Quần**
- **XS:** Eo 73cm, Hông 84cm, Dài 94cm  
- **S:** Eo 77cm, Hông 88cm, Dài 96cm  
- **M:** Eo 81cm, Hông 92cm, Dài 98cm  
- **L:** Eo 85cm, Hông 96cm, Dài 100cm  
- **XL:** Eo 89cm, Hông 100cm, Dài 102cm  

---

# **👚 Adidas – Size Nữ**

## **Áo (T-shirt & Polo)**
- **S:** Ngực 83cm, Eo 71cm, Hông 82cm, Dài 66cm  
- **M:** Ngực 89cm, Eo 77cm, Hông 88cm, Dài 69cm  
- **L:** Ngực 97cm, Eo 85cm, Hông 96cm, Dài 72cm  
- **XL:** Ngực 105cm, Eo 93cm, Hông 104cm, Dài 74cm  

## **Quần**
- **XS:** Eo 65cm, Hông 80cm, Dài 94cm  
- **S:** Eo 69cm, Hông 84cm, Dài 96cm  
- **M:** Eo 73cm, Hông 88cm, Dài 98cm  
- **L:** Eo 77cm, Hông 92cm, Dài 100cm  
- **XL:** Eo 81cm, Hông 96cm, Dài 102cm  

---

# **👚 Nike – Size Nữ**

## **Áo (T-shirt & Polo)**
- **S:** Ngực 84cm, Eo 74cm, Hông 85cm, Dài 67cm  
- **M:** Ngực 90cm, Eo 80cm, Hông 91cm, Dài 70cm  
- **L:** Ngực 98cm, Eo 88cm, Hông 99cm, Dài 73cm  
- **XL:** Ngực 106cm, Eo 96cm, Hông 107cm, Dài 76cm  

## **Quần**
- **XS:** Eo 66cm, Hông 81cm, Dài 93cm  
- **S:** Eo 70cm, Hông 85cm, Dài 95cm  
- **M:** Eo 74cm, Hông 89cm, Dài 97cm  
- **L:** Eo 78cm, Hông 93cm, Dài 99cm  
- **XL:** Eo 82cm, Hông 97cm, Dài 101cm  

---

# **👚 Uniqlo – Size Nữ**

## **Áo (T-shirt & Polo)**
- **S:** Ngực 85cm, Eo 75cm, Hông 86cm, Dài 68cm  
- **M:** Ngực 91cm, Eo 81cm, Hông 92cm, Dài 71cm  
- **L:** Ngực 99cm, Eo 89cm, Hông 100cm, Dài 74cm  
- **XL:** Ngực 107cm, Eo 97cm, Hông 108cm, Dài 77cm  

## **Quần**
- **XS:** Eo 67cm, Hông 82cm, Dài 92cm  
- **S:** Eo 71cm, Hông 86cm, Dài 94cm  
- **M:** Eo 75cm, Hông 90cm, Dài 96cm  
- **L:** Eo 79cm, Hông 94cm, Dài 98cm  
- **XL:** Eo 83cm, Hông 98cm, Dài 100cm  

---

## **Bước 3: Chọn size phù hợp**

**Nếu đo được nằm giữa 2 size:**
- Thích mặc rộng, thoải mái → Chọn size lớn hơn  
- Thích mặc ôm, fit → Chọn size nhỏ hơn  
- Vóc người to/nhỏ đặc biệt → Ưu tiên chiều cao + cân nặng  

**Tips chọn theo sản phẩm:**
- Áo thun/polo → theo vòng ngực + chiều dài  
- Quần dài → theo vòng eo + chiều dài  
- Áo khoác → nên tăng 1 size  
`,
    content_type: 'GUIDE',
    tags: ['size', 'huong-dan', 'do-luong', 'chon-size'],
    status: true,
  },

  // GUIDE - CARE
  {
    slug: 'guide-clothing-care',
    title: 'Hướng dẫn bảo quản quần áo',
    content: `**Hướng dẫn bảo quản quần áo đúng cách:**

**1. Giặt - Làm sạch**

**Áo thun cotton:**
- Giặt với nước lạnh hoặc ấm (dưới 40°C)
- Lộn trái áo trước khi giặt (bảo vệ hình in, màu sắc)
- Không giặt chung với đồ sẫm màu lần đầu
- Không dùng tẩy trắng (chlorine bleach)
- Giặt máy: chế độ nhẹ nhàng (gentle)

**Áo thể thao (polyester, nylon):**
- Giặt ngay sau khi vận động (tránh mùi, vi khuẩn)
- Nước lạnh đến ấm (dưới 60°C)
- Dùng nước xả vải chuyên dụng cho đồ thể thao
- Không sấy khô nhiệt độ cao

**Quần jeans:**
- Giặt lần đầu riêng (tránh lộn màu)
- Lộn trái, giặt với nước lạnh
- Không giặt quá thường xuyên (3-5 lần mặc/1 lần giặt)
- Phơi trong bóng râm, không phơi trực tiếp nắng

**Áo sơ mi:**
- Giặt tay hoặc máy giặt chế độ nhẹ
- Nước ấm 30-40°C
- Không vắt mạnh, để ráo nước tự nhiên
- Là ngay khi áo còn hơi ẩm (dễ là phẳng)

**2. Phơi - Sấy khô**

**Phơi tự nhiên:**
- Phơi trong bóng râm, thoáng gió
- Lộn trái áo (tránh phai màu)
- Không phơi ngoài nắng gắt (làm hỏng vải)
- Áo khoác, áo len: trải phẳng trên giá (tránh giãn)

**Sấy máy:**
- Chỉ sấy với nhiệt độ thấp (low heat)
- Không sấy khô hoàn toàn (lấy ra khi còn hơi ẩm)
- Không sấy áo len, áo co giãn

**3. Là - Ủi**

**Nhiệt độ là:**
- Cotton: 150-180°C (nhiệt độ cao)
- Polyester: 110-130°C (nhiệt độ trung bình)
- Linen: 180-220°C (rất cao, phun nước)
- Len: 100-120°C (thấp, qua khăn ẩm)

**Cách là:**
- Lộn trái áo có hình in
- Phun ẩm nhẹ trước khi là (dễ là phẳng)
- Là theo chiều dọc sợi vải
- Áo sơ mi: là cổ áo, vai, thân áo, tay áo

**4. Bảo quản**

**Treo tủ:**
- Áo sơ mi, áo khoác, áo vest
- Dùng móc áo có vai (giữ form)
- Không treo áo len (bị giãn)

**Gấp trong ngăn kéo:**
- Áo thun, áo polo, quần jean
- Gấp gọn gàng, xếp thẳng đứng (dễ tìm)
- Cho gói hút ẩm, thơm quần áo

**Bảo quản dài hạn:**
- Giặt sạch trước khi cất (tránh mốc)
- Cho vào túi vải (không dùng túi nilon)
- Để nơi khô ráo, thoáng mát
- Kiểm tra định kỳ 1-2 tháng`,
    content_type: 'GUIDE',
    tags: ['bao-quan', 'care', 'giat-ui', 'lam-sach'],
    status: true,
  },

  // POLICY
  {
    slug: 'policy-privacy',
    title: 'Chính sách bảo mật thông tin',
    content: `**Chính sách bảo mật thông tin khách hàng:**

**1. Thông tin chúng tôi thu thập:**
- Họ tên, số điện thoại, email
- Địa chỉ giao hàng
- Lịch sử mua hàng, sở thích sản phẩm
- Thông tin thanh toán (qua cổng bảo mật)

**2. Mục đích sử dụng thông tin:**
- Xử lý đơn hàng, giao hàng
- Chăm sóc khách hàng, giải đáp thắc mắc
- Gửi thông báo khuyến mãi (nếu đồng ý)
- Cải thiện dịch vụ, trải nghiệm mua sắm

**3. Cam kết bảo mật:**
- Không bán, chia sẻ thông tin cho bên thứ 3 (trừ đối tác vận chuyển, thanh toán)
- Mã hóa dữ liệu nhạy cảm (SSL 256-bit)
- Tuân thủ Luật Bảo vệ Dữ liệu Cá nhân (2020)
- Lưu trữ an toàn trên server có chứng nhận

**4. Quyền của khách hàng:**
- Xem, sửa, xóa thông tin cá nhân
- Từ chối nhận email marketing
- Yêu cầu xóa tài khoản và dữ liệu

**5. Liên hệ về bảo mật:**
- Email: privacy@store.com
- Hotline: 1900-xxxx`,
    content_type: 'POLICY',
    tags: ['bao-mat', 'privacy', 'du-lieu', 'thong-tin'],
    status: true,
  },

  // ABOUT
  {
    slug: 'about-us',
    title: 'Về chúng tôi',
    content: `**GIỚI THIỆU VỀ CHÚNG TÔI**

Chào mừng bạn đến với **Fashion Store** - Điểm đến tin cậy cho những tín đồ thời trang!

**Câu chuyện thương hiệu:**
Thành lập từ năm 2020, chúng tôi bắt đầu từ một cửa hàng nhỏ với niềm đam mê mang đến những sản phẩm thời trang chất lượng cao từ các thương hiệu nổi tiếng thế giới. Sau 4 năm phát triển, Fashion Store đã trở thành đối tác chính thức của:
- **Adidas** - Thương hiệu thể thao Đức với lịch sử 70+ năm
- **Nike** - Biểu tượng toàn cầu với slogan "Just Do It"  
- **Uniqlo** - Thời trang Nhật Bản tối giản, chất lượng

**Sứ mệnh:**
Mang đến trải nghiệm mua sắm tuyệt vời với sản phẩm chính hãng, giá cả hợp lý, dịch vụ tận tâm.

**Giá trị cốt lõi:**
- **Chính hãng 100%**: Cam kết sản phẩm authentic, có tem chống giả
- **Giá tốt nhất**: Giá niêm yết, không chặt chém
- **Dịch vụ tận tâm**: Tư vấn nhiệt tình, đổi trả dễ dàng
- **Giao hàng nhanh**: Ship toàn quốc, nhanh chóng

**Thành tựu:**
- 50.000+ khách hàng tin tưởng
- 4.8/5 sao đánh giá (trên 10.000 reviews)
- 3 showroom tại HCM, HN, ĐN
- Đối tác vận chuyển: GHN, GHTK, J&T

**Hệ thống cửa hàng:**
- TP.HCM: 123 Nguyễn Trãi, Q.1 (8:00 - 22:00)
- Hà Nội: 456 Trần Duy Hưng, Cầu Giấy (8:00 - 22:00)
- Đà Nẵng: 789 Lê Duẩn, Q. Hải Châu (8:00 - 22:00)`,
    content_type: 'ABOUT',
    tags: ['gioi-thieu', 'about', 've-chung-toi', 'company'],
    status: true,
  },

  // CONTACT
  {
    slug: 'contact-info',
    title: 'Thông tin liên hệ',
    content: `**THÔNG TIN LIÊN HỆ**

**Hotline (hỗ trợ 24/7):**
📞 1900-xxxx (miễn phí)
📞 028-xxxx-xxxx (TP.HCM)
📞 024-xxxx-xxxx (Hà Nội)

**Email:**
📧 support@fashionstore.com (Hỗ trợ khách hàng)
📧 order@fashionstore.com (Đơn hàng)
📧 warranty@fashionstore.com (Bảo hành)

**Mạng xã hội:**
📘 Facebook: /fashionstore.vn
📸 Instagram: @fashionstore.vn
🎵 TikTok: @fashionstore.vn
🔵 Zalo: 091-234-5678

**Địa chỉ cửa hàng:**

**TP. Hồ Chí Minh:**
📍 123 Nguyễn Trãi, P. Bến Thành, Q.1
⏰ 8:00 - 22:00 (Tất cả các ngày)
🚇 Gần Bến xe Miền Đông

**Hà Nội:**
📍 456 Trần Duy Hưng, P. Trung Hòa, Q. Cầu Giấy
⏰ 8:00 - 22:00 (Tất cả các ngày)

**Đà Nẵng:**
📍 789 Lê Duẩn, Q. Hải Châu
⏰ 8:00 - 22:00 (Tất cả các ngày)`,
    content_type: 'CONTACT',
    tags: ['lien-he', 'contact', 'hotline', 'dia-chi'],
    status: true,
  },
];

// ========== EMBEDDING ==========
interface GeminiResponse {
  embedding?: { values: number[] };
}

async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'text-embedding-004',
        content: { parts: [{ text }] },
      }),
    },
  );

  const data = (await res.json()) as GeminiResponse;

  if (!data.embedding?.values) {
    console.error('Gemini embedding failed:', data);
    throw new Error('Gemini embedding failed');
  }

  return data.embedding.values;
}

// ========== UPSERT WITH CHUNKS ==========
async function upsertSiteContentWithChunks(siteContent: (typeof siteContentsData)[0]) {
  const { slug, title, content, content_type, tags, status } = siteContent;

  // Build full text
  const fullText = `${title}\n\n${content}`;

  // Chunk with overlap
  const chunks = chunkTextWithOverlap(fullText, {
    chunkSize: 1000,
    overlapSize: 200,
    minChunkSize: 200,
  });

  console.log(`📄 Processing "${slug}": ${chunks.length} chunks`);

  // Upsert each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const chunkId = chunks.length === 1 ? slug : `${slug}_chunk_${i + 1}`;

    // Map content_type
    const content_typeMap: Record<string, string> = {
      FAQ: 'Câu hỏi thường gặp',
      POLICY: 'Chính sách',
      GUIDE: 'Hướng dẫn',
      ABOUT: 'Giới thiệu',
      CONTACT: 'Liên hệ',
    };

    const embedding = await embedText(chunkText);

    const metadata = {
      type: 'site_content',
      slug,
      title,
      content_type,
      content_type_name: content_typeMap[content_type] || content_type,
      tags,
      status,

      // Chunk info
      chunk_index: i,
      total_chunks: chunks.length,
      is_first_chunk: i === 0,
      is_last_chunk: i === chunks.length - 1,

      // Flags for easy filtering
      is_faq: content_type === 'FAQ',
      is_policy: content_type === 'POLICY',
      is_guide: content_type === 'GUIDE',
      is_about: content_type === 'ABOUT',
      is_contact: content_type === 'CONTACT',

      // Detail flags based on tags
      is_shipping: tags?.includes('giao-hang') || tags?.includes('shipping'),
      is_payment: tags?.includes('thanh-toan') || tags?.includes('payment'),
      is_return: tags?.includes('doi-tra') || tags?.includes('return'),
      is_warranty: tags?.includes('bao-hanh') || tags?.includes('warranty'),
      is_size_guide: tags?.includes('size') || tags?.includes('do-luong'),
      is_care_guide: tags?.includes('bao-quan') || tags?.includes('giat-ui'),
    };

    const { error } = await supabase.from('documents').upsert(
      {
        source_id: chunkId,
        content: chunkText,
        metadata,
        embedding,
        source_table: 'site_contents',
      },
      { onConflict: 'source_id' },
    );

    if (error) {
      console.error(`❌ Error on ${chunkId}:`, error);
    } else {
      console.log(`✅ Chunk ${i + 1}/${chunks.length}: ${chunkId}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// ========== SEED FUNCTION ==========
export async function seedSiteContents(prisma: PrismaClient) {
  console.log('📄 Seeding site_contents to local DB...');

  await prisma.site_contents.createMany({
    data: siteContentsData,
    skipDuplicates: true,
  });

  console.log('🧠 Syncing site_contents to Supabase Vector with chunking...');

  for (const sc of siteContentsData) {
    // Check if already exists
    const { data: exists } = await supabase
      .from('documents')
      .select('source_id')
      .like('source_id', `${sc.slug}%`)
      .maybeSingle();

    if (exists) {
      console.log(`⏭️ Skip exists: ${sc.slug}`);
      continue;
    }

    await upsertSiteContentWithChunks(sc);
  }

  console.log('🎉 Site contents seed & embedding with chunking DONE!');
}

// ========== HELPER: Re-chunk existing content ==========
export async function rechunkSiteContent(slug: string, prisma: PrismaClient) {
  // Get from DB
  const content = await prisma.site_contents.findUnique({
    where: { slug },
  });

  if (!content) {
    throw new Error(`Site content ${slug} not found`);
  }

  // Delete old chunks
  await supabase.from('documents').delete().like('source_id', `${slug}%`);

  // Re-chunk and upsert
  await upsertSiteContentWithChunks(content);

  console.log(`✅ Re-chunked: ${slug}`);
}
