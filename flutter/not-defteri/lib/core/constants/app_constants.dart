/// Uygulama genelinde kullanılan sabitler
class AppConstants {
  AppConstants._();

  // Uygulama bilgileri
  static const String appName = 'Stitch Notes';
  static const String appVersion = '1.0.0';

  // Veritabanı
  static const String databaseName = 'stitch_notes.db';
  static const int databaseVersion = 1;

  // Tablo isimleri
  static const String notesTable = 'notes';
  static const String foldersTable = 'folders';

  // SharedPreferences keys
  static const String themeKey = 'theme_mode';
  static const String viewModeKey = 'view_mode';
  static const String viewModeKeyFolders = 'view_mode_folders';
  static const String pinnedNotesKey = 'pinned_notes';
  static const String onboardingCompletedKey = 'onboarding_completed';

  // Security keys
  static const String securityPinKey = 'security_pin';
  static const String securityEnabledKey = 'security_enabled';

  // Tablo isimleri
  static const String trashTable = 'trash';

  // Animasyon süreleri
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 350);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Debounce süreleri
  static const Duration autoSaveDebounce = Duration(seconds: 2);
}
