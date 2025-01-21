🎤 Kullanıcı Tabanlı Ses Tanıma Uygulaması

Bu proje, kullanıcının kendi ses dosyasını yükleyerek model eğitmesi ve daha sonra ses tanıma işlemi yaparak gelen sesin o kullanıcıya ait olup olmadığını belirlemesini sağlar.

🚀 Özellikler

📂 Ses Yükleme: Kullanıcı, kendi ses dosyasını sisteme yükler.

🧠 Model Eğitme: Kullanıcının yüklediği ses dosyasıyla bir makine öğrenmesi modeli eğitilir.

🔍 Ses Tanıma: Kullanıcının yeni yüklediği bir ses, eğitilmiş model ile karşılaştırılarak tahminde bulunulur.

🛠️ Kurulum ve Çalıştırma

1️⃣ Depoyu Klonlayın

Projeyi yerel bilgisayarınıza indirin:

git clone [GitHub Repo Linkiniz]
cd voice_recognition

2️⃣ Backend Kurulumu (Python & Flask)

Backend tarafının çalışabilmesi için aşağıdaki adımları takip edin:

Backend'i Çalıştırma

cd backend
pip install -r requirements.txt
python app.py

Bu işlem başarılı olduğunda http://localhost:5000 adresinde API çalışacaktır.

3️⃣ Frontend Kurulumu (React.js)

React.js ile oluşturulan frontend'i çalıştırmak için:

cd client
npm install
npm start

Bu komutları çalıştırdıktan sonra http://localhost:3000 adresinden uygulamaya erişebilirsiniz.

📌 Kullanım Adımları

1️⃣ Ses Dosyası Yükle butonu ile kendi sesinizi yükleyin.2️⃣ Modeli Eğit butonuna basarak yüklenen sesi backend'e gönderin ve model eğitilsin.3️⃣ Tahmin Et butonuna basarak yeni bir ses dosyası yükleyin ve sistemin sesi tanıyıp tanımadığını görün.

🛠️ Kullanılan Teknolojiler

Frontend: React.js (Fetch API, File Upload)

Backend: Python, Flask

Makine Öğrenmesi: Librosa, TensorFlow/Keras

Veri Formatı: WAV (Waveform Audio File)

📄 Lisans

Bu proje MIT lisansı altında sunulmuştur.

📌 Geliştirici: [Adınız]📅 Proje Tarihi: Ocak 2025