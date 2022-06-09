# Proyek Akhir - Grafika Komputer

## Anggota Kelompok `insom`

1. Hasiana Emanuela Rajagukguk - 1906293083
2. Vanessa Emily Agape - 1906350793
3. Asfiolitha Wilmarani - 1906350944

## Cara Menggunakan Program
### Menjalankan Program
Program dapat dijalankan dengan membuka file `Hirarki.html` di browser. Bisa juga menggunakan live server/http server. 

### Mengatur Animasi/Kamera/Lighting
- Animasi dapat di-toggle on/off melalui checkbox `use animation` di general controls. **General Controls > Use Animation**
- Default camera dapat diatur sudut pandang dan posisinya melalui slider di general controls. **General Controls > Camera Controls**
- Sudut pandang kamera dapat diatur menjadi sudut pandang `puppy` dengan mengganti POV pada drop down. **General Controls > Camera Controls > Dropdown Camera**
- Pencahayaan (point light & ambient light) dapat diatur di general controls. **General Controls > Light Controls**

### Menggerakkan Model
Model `duckling`, `kitten`, dan `puppy` dapat diatur pergerakannya melalui slider pada tab masing-masing model.

> Model tidak dapat digerakkan secara manual bila mode animasi sedang menyala.

- **Duckling**: atur pergerakan badan, kepala dan sayap di tab `duckling`
- **Kitten**: atur pergerakan badan, telinga, dan ekor di tab `kitten`
- **Puppy**: atur pergerakan badan, telinga, dan ekor di tab `puppy`

## Proses Pembentukan Objek
- Pertama, dibuat bentuk-bentuk base dengan matrix. Pada tahap ini, dibuat bentuk seperti kubus, piramid, dan bentuk-bentuk lainnya, lalu ditambahkan tekstur.
- Setelah itu, bentuk basis diatur ukurannya, disatukan dan digambarkan di canvas. Pada tahap ini, dilakukan translate untuk posisi yang benar, dan juga animasi seperti rotate, translate, dll.
- Bentuk basis yang telah disatukan ini membentuk 3 hierarchical model, yaitu `duckling`, `kitten`, dan `puppy` serta 2 bentuk sederhana, yaitu `cube` dan `box`. 

## Proses rendering objek dan scene
- Pertama, bentuk-bentuk dibuat, seperti yang telah dijelaskan di bagian [Proses Pembentukan Objek](#proses-pembentukan-objek).
- Bentuk-bentuk tersebut merupakan node-node yang berada dalam tree. Node-node akan diatur posisinya dan kemudian tree tersebut ditraverse pada saat merender canvas. 
- Animasi dijalankan dengan menambahkan/mengurangi value `angle` pada node tersebut dan diaplikasikan pada rotate atau translate saat pembuatan objek. Value ini juga diintegrasi dengan slider yang ada pada UI.
- Pengaturan camera diadaptasi dari contoh yang tersedia di scele. Sudut pandang diatur melalui function `lookAt` yang argumennya mengambil input dari slider di general controls. User bisa menggeser-geser posisi kamera, mendekat dan menjauh, serta mengatur orientasi kamera default. 
- Kamera puppy diatur dengan cara yang serupa, namun function `lookAt` memanfaatkan koordinat dari kepala model puppy (kira-kira di bagian matanya) sehingga seolah kamera menunjukkan sudut pandang model puppy. 
- Tekstur diinisialisasi pertama kali dalam fungsi `initTexture` yang dipanggil saat halaman pertama kali loaded. Asset di-load secara asynchronous, lalu data image nya di-bind menjadi texture dalam fungsi `configureTexture`. Kami menggunakan enam image untuk texture, masing-masingnya dipetakan dengan `gl.TEXTURE{X}` dimana `{X}` adalah index urutan texture tersebut diinisialisasi. 


## Log Pekerjaan dan Tugas
### Hasiana Emanuela Rajagukguk
- Menambahkan tekstur pada canvas
- Mengatur kamera view, baik kamera default ataupun kamera puppy
- Mengatur opsi perubahan mode objek, yaitu shading dan wireframe
- Kontribusi dalam mengatur lighting dan bayangan
- Membuat dokumentasi bagian pembentukan objek dan rendering.

### Vanessa Emily Agape
- Membuat model puppy, cat, cube, dan box
- Mengatur animasi model puppy, cat, cube, dan box
- Membuat dokumentasi program bagian model puppy, cat, cube, dan box
- Kontribusi dalam mengatur lighting dan bayangan
- Membuat dokumentasi bagian pembentukan objek dan rendering.

### Asfiolitha Wilmarani
- Membuat model duck
- Mengatur animasi model duck
- Membuat dokumentasi program bagian model duck
- Mengatur tampilan UI 
- Menambahkan dokumentasi cara menggunakan program
- Kontribusi dalam mengatur lighting dan bayangan

## Referensi
- [Sample Hierarchical Modelling](https://scele.cs.ui.ac.id/mod/resource/view.php?id=103463)