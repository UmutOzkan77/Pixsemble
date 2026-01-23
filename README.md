# 🎨 Pixsemble

**Paralel Yapay Zeka Görsel Üretim Platformu**

Pixsemble, yüzlerce yapay zeka görselini aynı anda, güçlü değişken şablonları kullanarak üretmenizi sağlayan modern ve kullanıcı dostu bir web uygulamasıdır. GitHub Pages uyumludur ve tamamen tarayıcı üzerinde çalışır.

[![Status](https://img.shields.io/badge/Durum-Haz%C4%B1r-brightgreen?style=for-the-badge)](https://github.com/UmutOzkan77/Pixsemble)
[![License](https://img.shields.io/badge/Lisans-MIT-blue?style=for-the-badge)](LICENSE)
[![Technology](https://img.shields.io/badge/Teknoloji-JS%20%2F%20HTML%20%2F%20CSS-orange?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✨ Öne Çıkan Özellikler

- **🤖 Çoklu Sağlayıcı Desteği**
  - **Nano Banana:** Google Gemini (Imagen 3) gücüyle hızlı ve kaliteli üretim.
  - **GPT Image:** OpenAI DALL-E 3 entegrasyonu ile sanatsal detaylar.

- **📝 Dinamik Değişken Şablonları**
  - `[renk]`, `[hayvan]`, `[stil]` gibi sözdizimi ile toplu üretim.
  - **Kombinasyon Modu:** Tüm değişkenlerin birbirleriyle olan tüm kombinasyonlarını üretir.
  - **Bağlantılı Mod:** Satır bazlı eşleştirme ile kontrollü üretim.

- **⚡ Ultra Hızlı Paralel İşleme**
  - 16'ya kadar eşzamanlı istek kapasitesi.
  - Gerçek zamanlı ilerleme takibi ve dinamik durum çubuğu.
  - Hata durumunda otomatik yeniden deneme (exponential backoff).

- **🎨 Gelişmiş Araçlar**
  - **Düzenleme Modu:** Mevcut görselleri yapay zeka ile dönüştürün.
  - **Stil Referansı:** Bir görseli referans alarak benzer stilde üretim yapın.
  - **Toplu İndirme:** Üretilen tüm görselleri tek tıkla ZIP olarak indirin.
  - **Maliyet Tahmini:** Üretim öncesi olası maliyeti anlık olarak görün.

---

## 🚀 Hızlı Başlangıç

### Seçenek 1: Yerel Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/UmutOzkan77/Pixsemble.git
cd Pixsemble

# Yerel bir sunucu başlatın
python3 -m http.server 8080

# Tarayıcıda açın
open http://localhost:8080
```

### Seçenek 2: GitHub Pages

1. Kendi GitHub hesabınıza 'Fork' yapın.
2. **Settings → Pages** sekmesine gidin.
3. Kaynak olarak `main` dalını (branch) seçin.
4. Uygulamanız `https://KULLANICI_ADINIZ.github.io/Pixsemble` adresinde yayına girecektir!

---

## 📖 Kullanım Kılavuzu

### 1. API Anahtarı Kurulumu

Uygulamayı ilk açtığınızda, seçtiğiniz sağlayıcı için API anahtarınızı girmeniz gerekir:

| Sağlayıcı | Anahtar Nereden Alınır? |
|-----------|-------------------------|
| **Nano Banana** | [Google AI Studio](https://aistudio.google.com/apikey) |
| **GPT Image** | [OpenAI Platform](https://platform.openai.com/api-keys) |

### 2. Değişkenli Prompt Yazımı

Örnek bir prompt:
`Güzel bir [renk] [hayvan], [stil] tarzında illüstrasyon`

### 3. Değişken Değerlerini Ekleme

- **renk**: mavi, kırmızı, yeşil
- **hayvan**: kedi, köpek
- **stil**: suluboya, yağlı boya

Bu ayar ile toplam **12 farklı kombinasyon** (3 × 2 × 2) saniyeler içinde oluşturulacaktır.

### 4. Üretim

"Generate Images" butonuna basın ve yapay zekanın gücünü izleyin!

---

## 🔧 Teknik Detaylar

### Proje Yapısı

```text
Pixsemble/
├── index.html           # Ana uygulama arayüzü
├── css/
│   └── style.css        # Cam (Glassmorphism) UI stilleri
├── js/
│   ├── app.js           # Ana uygulama kontrolcüsü
│   ├── api-providers.js # API soyutlama katmanı
│   ├── variable-parser.js # [değişken] sözdizimi ayrıştırıcısı
│   ├── image-queue.js   # Paralel işleme motoru
│   └── storage.js       # Yerel depolama yönetimi
└── .gitignore           # Güvenlik için API anahtarlarını korur
```

### ⚠️ Nano Banana için CORS ve Proxy Gereksinimi

Google AI Studio (Gemini/Imagen) uç noktaları tarayıcıdan doğrudan çağrıldığında CORS tarafından engellenebilir. GitHub Pages gibi statik ortamlarda Nano Banana çalıştırmak için bir **proxy** gereklidir.

**Önerilen yaklaşım (Cloudflare Worker):**

1. `proxy/cloudflare-worker.js` dosyasını Cloudflare Workers'a dağıtın.
2. Worker URL'sini ayarlarda **Nano Banana Proxy URL** alanına girin.
3. Uygulama istekleri otomatik olarak proxy üzerinden iletir.

Bu proxy, yalnızca `generativelanguage.googleapis.com` isteklerini geçirir ve CORS başlıklarını ekler.

### Tarayıcı Desteği

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

---

## 🔒 Güvenlik ve Gizlilik

- API anahtarlarınız **sadece tarayıcınızın yerel depolamasında (localStorage)** saklanır.
- Anahtarlar asla Pixsemble sunucularına veya herhangi bir üçüncü tarafa gönderilmez.
- `NanoApp` klasörü ve diğer hassas veriler `.gitignore` ile korunmaktadır.

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Dilediğiniz gibi kullanabilir ve geliştirebilirsiniz!

---

**OZKI** tarafından yapıldı.
