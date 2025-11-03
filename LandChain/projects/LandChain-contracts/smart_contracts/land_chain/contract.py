from algopy import ARC4Contract, String, UInt64
from algopy.arc4 import abimethod

class LandChain(ARC4Contract):
    def __init__(self) -> None:
        self.pemilik = String("")
        self.luas = String("")
        self.lokasi = String("")
        self.nomor_sertifikat = String("")
        self.status_verifikasi = UInt64(0)
        self.tanah_id = String("")

    @abimethod
    def register_tanah(
        self,
        tanah_id: String,
        pemilik: String,
        luas: String,
        lokasi: String
    ) -> String:
        """Mendaftarkan tanah baru"""
        self.tanah_id = tanah_id
        self.pemilik = pemilik
        self.luas = luas
        self.lokasi = lokasi
        self.status_verifikasi = UInt64(0)
        
        return String("Tanah berhasil didaftarkan: ") + tanah_id

    @abimethod
    def buat_sertifikat(
        self,
        nomor_sertifikat: String
    ) -> String:
        """Membuat sertifikat tanah"""
        self.nomor_sertifikat = nomor_sertifikat
        return String("Sertifikat berhasil dibuat: ") + nomor_sertifikat

    @abimethod
    def verifikasi_tanah(self) -> String:
        """Memverifikasi tanah"""
        self.status_verifikasi = UInt64(1)
        return String("Tanah berhasil diverifikasi")

    @abimethod
    def pindah_kepemilikan(
        self,
        pemilik_baru: String
    ) -> String:
        """Memindahkan kepemilikan tanah"""
        # Cek apakah tanah sudah terverifikasi
        if self.status_verifikasi == UInt64(1):
            pemilik_lama = self.pemilik
            self.pemilik = pemilik_baru
            # Reset status verifikasi setelah pindah kepemilikan
            self.status_verifikasi = UInt64(0)
            return String("Kepemilikan dipindahkan dari ") + pemilik_lama + String(" ke ") + pemilik_baru
        else:
            return String("Error: Tanah harus terverifikasi sebelum pindah kepemilikan")

    @abimethod
    def get_info_tanah(self) -> String:
        """Mendapatkan informasi lengkap tanah"""
        status_text = String("Terverifikasi") if self.status_verifikasi == UInt64(1) else String("Belum Terverifikasi")
        
        info = String("Informasi Tanah:")
        info += String("\nID: ") + self.tanah_id
        info += String("\nPemilik: ") + self.pemilik
        info += String("\nLuas: ") + self.luas
        info += String("\nLokasi: ") + self.lokasi
        info += String("\nSertifikat: ") + self.nomor_sertifikat
        info += String("\nStatus: ") + status_text
        
        return info

    @abimethod
    def hello(self, name: String) -> String:
        """Method testing"""
        return String("Hello, ") + name + String("! Selamat datang di LandChain.")