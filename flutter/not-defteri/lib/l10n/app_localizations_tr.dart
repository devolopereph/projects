// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Turkish (`tr`).
class AppLocalizationsTr extends AppLocalizations {
  AppLocalizationsTr([String locale = 'tr']) : super(locale);

  @override
  String get appTitle => 'Not Defteri';

  @override
  String get notes => 'Notlar';

  @override
  String get folders => 'Klasörler';

  @override
  String get graph => 'Graf';

  @override
  String get settings => 'Ayarlar';

  @override
  String get myNotes => 'Notlarım';

  @override
  String get searchNotes => 'Not ara...';

  @override
  String get searchFolders => 'Klasör ara...';

  @override
  String get searchInNote => 'Not içinde ara...';

  @override
  String get noResults => 'Sonuç bulunamadı';

  @override
  String noResultsFor(String query) {
    return '\"$query\" için sonuç bulunamadı';
  }

  @override
  String get noNotesYet => 'Henüz not yok';

  @override
  String get tapToCreate => 'İlk notunuzu oluşturmak için + butonuna tıklayın';

  @override
  String get noFoldersYet => 'Henüz klasör yok';

  @override
  String get tapToCreateFolder =>
      'İlk klasörünüzü oluşturmak için + butonuna tıklayın';

  @override
  String get untitledNote => 'Başlıksız not';

  @override
  String get untitledFolder => 'İsimsiz klasör';

  @override
  String get title => 'Başlık';

  @override
  String get done => 'Bitti';

  @override
  String get cancel => 'İptal';

  @override
  String get save => 'Kaydet';

  @override
  String get delete => 'Sil';

  @override
  String get edit => 'Düzenle';

  @override
  String get addPhoto => 'Fotoğraf Ekle';

  @override
  String get searchInNoteTooltip => 'Not İçinde Ara';

  @override
  String get closeSearch => 'Aramayı Kapat';

  @override
  String get pin => 'Sabitle';

  @override
  String get unpin => 'Sabitlemeyi Kaldır';

  @override
  String get moveToFolder => 'Klasöre Taşı';

  @override
  String get removeFromFolder => 'Klasörden Çıkar';

  @override
  String get selectFolder => 'Klasör Seçin';

  @override
  String get inFolder => 'Klasörde';

  @override
  String get deleteNote => 'Notu Sil';

  @override
  String deleteNoteConfirm(String title) {
    return '\"$title\" notunu silmek istediğinize emin misiniz?\n\nNot çöp kutusuna taşınacak.';
  }

  @override
  String get deleteNoteConfirmUntitled =>
      'Bu notu silmek istediğinize emin misiniz?\n\nNot çöp kutusuna taşınacak.';

  @override
  String get appearance => 'Görünüm';

  @override
  String get darkTheme => 'Karanlık Tema';

  @override
  String get useDarkTheme => 'Karanlık tema kullan';

  @override
  String get language => 'Dil';

  @override
  String get changeLanguage => 'Uygulama dilini değiştir';

  @override
  String get selectLanguage => 'Dil Seçin';

  @override
  String get english => 'İngilizce';

  @override
  String get turkish => 'Türkçe';

  @override
  String get dataManagement => 'Veri Yönetimi';

  @override
  String get trash => 'Çöp Kutusu';

  @override
  String get viewDeletedNotes => 'Silinen notları görüntüle';

  @override
  String get other => 'Diğer';

  @override
  String get about => 'Hakkında';

  @override
  String get appInfo => 'Uygulama bilgileri';

  @override
  String version(String version) {
    return 'Sürüm $version';
  }

  @override
  String versionWithBuild(String version, String buildNumber) {
    return 'Sürüm $version ($buildNumber)';
  }

  @override
  String get loadingVersion => 'Sürüm yükleniyor...';

  @override
  String get richTextNotesApp => 'Zengin metin destekli not uygulaması';

  @override
  String get trashEmpty => 'Çöp kutusu boş';

  @override
  String get deletedNotesAppear => 'Silinen notlar burada görünecek';

  @override
  String get emptyTrash => 'Çöp Kutusunu Boşalt';

  @override
  String get emptyTrashConfirm =>
      'Çöp kutusundaki tüm notları kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.';

  @override
  String get restore => 'Geri Getir';

  @override
  String get noteRestored => 'Not geri getirildi';

  @override
  String get deletePermanently => 'Kalıcı Olarak Sil';

  @override
  String deletePermanentlyConfirm(String title) {
    return '\"$title\" notunu kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.';
  }

  @override
  String get deletePermanentlyConfirmUntitled =>
      'Bu notu kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.';

  @override
  String get justNow => 'Az önce';

  @override
  String minutesAgo(int minutes) {
    return '${minutes}d önce';
  }

  @override
  String hoursAgo(int hours) {
    return '${hours}sa önce';
  }

  @override
  String daysAgo(int days) {
    return '$days gün önce';
  }

  @override
  String get deletedJustNow => 'Az önce silindi';

  @override
  String deletedMinutesAgo(int minutes) {
    return '$minutes dakika önce silindi';
  }

  @override
  String deletedHoursAgo(int hours) {
    return '$hours saat önce silindi';
  }

  @override
  String deletedDaysAgo(int days) {
    return '$days gün önce silindi';
  }

  @override
  String deletedOnDate(String date) {
    return '$date tarihinde silindi';
  }

  @override
  String get unknownDate => 'Bilinmeyen tarih';

  @override
  String get errorOccurred => 'Bir hata oluştu';

  @override
  String get tryAgain => 'Tekrar Dene';

  @override
  String get listView => 'Liste Görünümü';

  @override
  String get gridView => 'Izgara Görünümü';

  @override
  String get graphView => 'Graf Görünümü';

  @override
  String get familyTreeView => 'Soy Ağacı Görünümü';

  @override
  String get addNoteToUseFamilyTree =>
      'Not ekleyerek soy ağacı görünümünü kullanın';

  @override
  String get newest => 'En Yeni';

  @override
  String get oldest => 'En Eski';

  @override
  String get reset => 'Sıfırla';

  @override
  String get addNoteToUseGraph => 'Not ekleyerek graf görünümünü kullanın';

  @override
  String get emptyNote => 'Boş not';

  @override
  String get newFolder => 'Yeni Klasör';

  @override
  String get editFolder => 'Klasörü Düzenle';

  @override
  String get folderName => 'Klasör Adı';

  @override
  String get enterFolderName => 'Klasör adını girin';

  @override
  String get pleaseEnterFolderName => 'Lütfen klasör adı girin';

  @override
  String get selectColor => 'Renk Seçin';

  @override
  String get deleteFolder => 'Klasörü Sil';

  @override
  String deleteFolderConfirm(String name) {
    return '\"$name\" klasörünü silmek istediğinize emin misiniz?\n\nKlasördeki notlar silinmeyecek, sadece klasör kaldırılacak.';
  }

  @override
  String get deleteFolderConfirmUntitled =>
      'Bu klasörü silmek istediğinize emin misiniz?\n\nKlasördeki notlar silinmeyecek, sadece klasör kaldırılacak.';

  @override
  String noteCount(int count) {
    return '$count not';
  }

  @override
  String get noNotesInFolder => 'Bu klasörde not yok';

  @override
  String get longPressToAdd =>
      'Notları bu klasöre eklemek için not kartına uzun basın';

  @override
  String get noFoldersYetCreateInSettings => 'Henüz klasör yok';

  @override
  String get createFolderInSettings =>
      'Ayarlar sekmesinden klasör oluşturabilirsiniz';

  @override
  String imageError(String error) {
    return 'Görsel eklenirken hata oluştu: $error';
  }

  @override
  String get backup => 'Yedekleme';

  @override
  String get backupAndRestore => 'Yedekleme ve Geri Yükleme';

  @override
  String get backupAndRestoreDescription =>
      'Verilerinizi yedekleyin veya geri yükleyin';

  @override
  String get backupTitle => 'Yedekleme ve Geri Yükleme';

  @override
  String get backupDescription =>
      'Tüm notlarınızı, klasörlerinizi ve ayarlarınızı bir ZIP dosyasına yedekleyin veya önceki bir yedekten geri yükleyin.';

  @override
  String get createBackup => 'Yedek Oluştur';

  @override
  String get createBackupDescription =>
      'Tüm verileri ZIP dosyası olarak dışa aktar';

  @override
  String get restoreBackup => 'Yedeği Geri Yükle';

  @override
  String get restoreBackupDescription => 'Yedek dosyasından verileri içe aktar';

  @override
  String get backupNote =>
      'Yedeğiniz tüm notları, klasörleri ve uygulama ayarlarını içerir. Güvenli bir yerde saklayın.';

  @override
  String get backupFileSubject => 'Not Defteri Yedek';

  @override
  String get backupCreatedSuccess => 'Yedek başarıyla oluşturuldu!';

  @override
  String backupCreatedError(String error) {
    return 'Yedekleme hatası: $error';
  }

  @override
  String get fileNotSelected => 'Dosya seçilmedi';

  @override
  String restoreSuccess(int notes, int folders) {
    return '$notes not ve $folders klasör geri yüklendi';
  }

  @override
  String restoreError(String error) {
    return 'Geri yükleme hatası: $error';
  }

  @override
  String get restoreComplete => 'Geri Yükleme Tamamlandı';

  @override
  String get restartAppMessage =>
      'Geri yüklenen tüm ayarları görmek için lütfen uygulamayı yeniden başlatın.';

  @override
  String get tapToSelectEmoji => 'İkon seçmek için dokunun';

  @override
  String get removeEmoji => 'Emojyi Kaldır';

  @override
  String get searchEmoji => 'Emoji ara...';

  @override
  String get onboardingWelcomeTitle => 'Not Defteri\'ne Hoş Geldiniz';

  @override
  String get onboardingWelcomeBody =>
      'Notlarınızı düzenli tutmanın en akıllı yolu. Güçlü ve basit bir not alma deneyimi sizi bekliyor.';

  @override
  String get onboardingOrganizeTitle => 'Düzenle ve Organize Et';

  @override
  String get onboardingOrganizeBody =>
      'Klasörler ile notlarınızı kategorilere ayırın. Emoji ikonları ile klasörlerinizi kişiselleştirin.';

  @override
  String get onboardingRichTextTitle => 'Zengin Metin Desteği';

  @override
  String get onboardingRichTextBody =>
      'Kalın, italik ve daha fazlası. Profesyonel görünümlü notlar oluşturun. Fotoğraf ekleyin ve notlarınızı zenginleştirin.';

  @override
  String get onboardingSecureTitle => 'Güvenli ve Yerel';

  @override
  String get onboardingSecureBody =>
      'Tüm verileriniz cihazınızda güvenle saklanır. Yedekleme ve geri yükleme özellikleri ile verilerinizi koruyun.';

  @override
  String get getStarted => 'Başlayalım';

  @override
  String get next => 'İleri';

  @override
  String get skip => 'Geç';

  @override
  String get archivedNotes => 'Arşivlenen Notlar';

  @override
  String get noArchivedNotes => 'Arşivde not yok';

  @override
  String get noArchivedNotesDescription =>
      'Arşivlediğiniz notlar burada görünecek';

  @override
  String get archive => 'Arşivle';

  @override
  String get unarchive => 'Arşivden Çıkar';

  @override
  String get noteArchived => 'Not arşivlendi';

  @override
  String get noteUnarchived => 'Not arşivden çıkarıldı';

  @override
  String get security => 'Güvenlik';

  @override
  String get securityDescription => 'Uygulama kilidi ayarları';

  @override
  String get securityInfo => 'Uygulama Güvenliği';

  @override
  String get securityInfoDescription =>
      'Uygulamanızı bir PIN kodu ile koruyun. Uygulama her açıldığında PIN kodunu girmeniz gerekecek.';

  @override
  String get pinSettings => 'Şifre Ayarları';

  @override
  String get pinLock => 'Şifre Kilidi';

  @override
  String get pinLockDescription => 'Uygulamayı açarken şifre iste';

  @override
  String get createPin => 'Şifre Oluştur';

  @override
  String get createPinDescription => 'Yeni bir 4 haneli şifre oluşturun';

  @override
  String get changePin => 'Şifreyi Değiştir';

  @override
  String get changePinDescription => 'Mevcut şifrenizi değiştirin';

  @override
  String get removePin => 'Şifreyi Kaldır';

  @override
  String get removePinDescription => 'Şifre korumasını kaldırın';

  @override
  String get enterPin => 'Şifrenizi Girin';

  @override
  String get enterPinDescription =>
      'Uygulamaya erişmek için 4 haneli şifrenizi girin';

  @override
  String get enterNewPin => 'Yeni 4 haneli şifrenizi girin';

  @override
  String get enterCurrentPin => 'Mevcut şifrenizi girin';

  @override
  String get confirmPin => 'Şifreyi Onayla';

  @override
  String get reenterPin => 'Şifrenizi tekrar girin';

  @override
  String get newPin => 'Yeni Şifre';

  @override
  String get wrongPin => 'Yanlış şifre';

  @override
  String get pinCreated => 'Şifre başarıyla oluşturuldu';

  @override
  String get pinChanged => 'Şifre başarıyla değiştirildi';

  @override
  String get pinRemoved => 'Şifre kaldırıldı';

  @override
  String get pinMismatch => 'Şifreler eşleşmiyor';

  @override
  String get deleteFolderToTrash => 'Klasörü çöp kutusuna taşı';

  @override
  String deleteFolderToTrashConfirm(String name) {
    return '\"$name\" klasörünü çöp kutusuna taşımak istediğinize emin misiniz?\n\nKlasördeki notlar klasörsüz olarak kalacak.';
  }

  @override
  String get deleteFolderToTrashConfirmUntitled =>
      'Bu klasörü çöp kutusuna taşımak istediğinize emin misiniz?\n\nKlasördeki notlar klasörsüz olarak kalacak.';

  @override
  String get folderRestored => 'Klasör geri getirildi';

  @override
  String get deleteFolderPermanently => 'Klasörü Kalıcı Olarak Sil';

  @override
  String deleteFolderPermanentlyConfirm(String name) {
    return '\"$name\" klasörünü kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.';
  }

  @override
  String get deleteFolderPermanentlyConfirmUntitled =>
      'Bu klasörü kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.';

  @override
  String get viewDeletedItems => 'Silinen öğeleri görüntüle';

  @override
  String get notesTab => 'Notlar';

  @override
  String get foldersTab => 'Klasörler';

  @override
  String get noDeletedFolders => 'Silinen klasör yok';

  @override
  String get deletedFoldersAppear => 'Silinen klasörler burada görünecek';

  @override
  String get emptyTrashFolders =>
      'Çöp kutusundaki tüm klasörleri kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.';

  @override
  String get privacyPolicy => 'Gizlilik Politikası';

  @override
  String get termsOfService => 'Kullanım Koşulları';

  @override
  String get reminder => 'Hatırlatıcı';

  @override
  String get addReminder => 'Hatırlatıcı Ekle';

  @override
  String get removeReminder => 'Hatırlatıcıyı Kaldır';

  @override
  String get reminderSet => 'Hatırlatıcı ayarlandı';

  @override
  String get reminderRemoved => 'Hatırlatıcı kaldırıldı';

  @override
  String get selectDateTime => 'Tarih ve Saat Seçin';

  @override
  String get reminderNotification => 'Not Hatırlatıcısı';

  @override
  String reminderNotificationBody(String title) {
    return 'Hatırlatıcı: $title';
  }

  @override
  String get today => 'Bugün';

  @override
  String get tomorrow => 'Yarın';

  @override
  String get pickDateTime => 'Tarih ve saat seç';

  @override
  String get reminderPastError => 'Geçmiş bir zaman seçemezsiniz';

  @override
  String get at => 'saat';

  @override
  String get archiveNote => 'Notu Arşivle';

  @override
  String archiveNoteConfirm(String title) {
    return '\"$title\" notunu arşivlemek istediğinize emin misiniz?\n\nArşivlenen notlar bölümünde bulabilirsiniz.';
  }

  @override
  String get archiveNoteConfirmUntitled =>
      'Bu notu arşivlemek istediğinize emin misiniz?\n\nArşivlenen notlar bölümünde bulabilirsiniz.';
}
