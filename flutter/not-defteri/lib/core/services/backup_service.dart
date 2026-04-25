import 'dart:convert';
import 'dart:io';
import 'package:archive/archive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/notes/data/datasources/note_local_data_source.dart';
import '../../features/notes/data/datasources/folder_local_data_source.dart';
import '../../features/notes/domain/entities/note.dart';
import '../../features/notes/domain/entities/folder.dart';

/// Yedekleme verisinin yapısı
class BackupData {
  final List<Note> notes;
  final List<Note> trashedNotes;
  final List<Note> archivedNotes;
  final List<Folder> folders;
  final Map<String, dynamic> settings;
  final String backupDate;
  final String appVersion;

  BackupData({
    required this.notes,
    required this.trashedNotes,
    required this.archivedNotes,
    required this.folders,
    required this.settings,
    required this.backupDate,
    required this.appVersion,
  });

  Map<String, dynamic> toJson() {
    return {
      'notes': notes.map((n) => n.toJson()).toList(),
      'trashedNotes': trashedNotes.map((n) => n.toJson()).toList(),
      'archivedNotes': archivedNotes.map((n) => n.toJson()).toList(),
      'folders': folders.map((f) => f.toJson()).toList(),
      'settings': settings,
      'backupDate': backupDate,
      'appVersion': appVersion,
    };
  }

  factory BackupData.fromJson(Map<String, dynamic> json) {
    return BackupData(
      notes:
          (json['notes'] as List?)
              ?.map((n) => Note.fromJson(n as Map<String, dynamic>))
              .toList() ??
          [],
      trashedNotes:
          (json['trashedNotes'] as List?)
              ?.map((n) => Note.fromJson(n as Map<String, dynamic>))
              .toList() ??
          [],
      archivedNotes:
          (json['archivedNotes'] as List?)
              ?.map((n) => Note.fromJson(n as Map<String, dynamic>))
              .toList() ??
          [],
      folders:
          (json['folders'] as List?)
              ?.map((f) => Folder.fromJson(f as Map<String, dynamic>))
              .toList() ??
          [],
      settings: (json['settings'] as Map<String, dynamic>?) ?? {},
      backupDate: json['backupDate'] as String? ?? '',
      appVersion: json['appVersion'] as String? ?? '',
    );
  }
}

/// Yedekleme ve geri yükleme servisi
class BackupService {
  final NoteLocalDataSource _noteDataSource;
  final FolderLocalDataSource _folderDataSource;
  final SharedPreferences _prefs;

  BackupService({
    required NoteLocalDataSource noteDataSource,
    required FolderLocalDataSource folderDataSource,
    required SharedPreferences prefs,
  }) : _noteDataSource = noteDataSource,
       _folderDataSource = folderDataSource,
       _prefs = prefs;

  /// Yedekleme dosyasının adını oluştur
  String _generateBackupFileName() {
    final now = DateTime.now();
    final dateStr =
        '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}_'
        '${now.hour.toString().padLeft(2, '0')}${now.minute.toString().padLeft(2, '0')}';
    return 'stitch_notes_backup_$dateStr.zip';
  }

  /// Tüm ayarları al
  Map<String, dynamic> _getSettings() {
    final settings = <String, dynamic>{};

    // Tema ayarı
    final themeValue = _prefs.get('theme_mode');
    if (themeValue != null) {
      settings['theme_mode'] = themeValue;
    }

    // Görünüm modu
    final viewModeValue = _prefs.get('view_mode');
    if (viewModeValue != null) {
      settings['view_mode'] = viewModeValue;
    }

    // Dil ayarı
    final localeValue = _prefs.getString('app_locale');
    if (localeValue != null) {
      settings['app_locale'] = localeValue;
    }

    return settings;
  }

  /// Ayarları geri yükle
  Future<void> _restoreSettings(Map<String, dynamic> settings) async {
    // Tema ayarı
    if (settings.containsKey('theme_mode')) {
      final value = settings['theme_mode'];
      if (value is bool) {
        await _prefs.setBool('theme_mode', value);
      }
    }

    // Görünüm modu
    if (settings.containsKey('view_mode')) {
      final value = settings['view_mode'];
      if (value is String) {
        await _prefs.setString('view_mode', value);
      } else if (value is bool) {
        await _prefs.setBool('view_mode', value);
      }
    }

    // Dil ayarı
    if (settings.containsKey('app_locale')) {
      final value = settings['app_locale'];
      if (value is String) {
        await _prefs.setString('app_locale', value);
      }
    }
  }

  /// Yedek oluştur ve dosya yolunu döndür
  Future<String> createBackup() async {
    // Tüm notları al (aktif olanlar)
    final notes = await _noteDataSource.getAllNotes();

    // Çöp kutusundaki notları al
    final trashedNotes = await _noteDataSource.getDeletedNotes();

    // Arşivlenmiş notları al
    final archivedNotes = await _noteDataSource.getArchivedNotes();

    // Tüm klasörleri al
    final folders = await _folderDataSource.getAllFolders();

    // Ayarları al
    final settings = _getSettings();

    // Yedekleme verisi oluştur
    final backupData = BackupData(
      notes: notes,
      trashedNotes: trashedNotes,
      archivedNotes: archivedNotes,
      folders: folders,
      settings: settings,
      backupDate: DateTime.now().toIso8601String(),
      appVersion: '1.0.0',
    );

    // JSON'a dönüştür
    final jsonString = jsonEncode(backupData.toJson());

    // Arşiv oluştur
    final archive = Archive();

    // JSON dosyasını arşive ekle
    final jsonBytes = utf8.encode(jsonString);
    final jsonFile = ArchiveFile(
      'backup_data.json',
      jsonBytes.length,
      jsonBytes,
    );
    archive.addFile(jsonFile);

    // ZIP olarak encode et
    final zipData = ZipEncoder().encode(archive);

    // Geçici dizine kaydet
    final tempDir = await getTemporaryDirectory();
    final fileName = _generateBackupFileName();
    final filePath = '${tempDir.path}/$fileName';

    final file = File(filePath);
    await file.writeAsBytes(zipData);

    return filePath;
  }

  /// Yedekten geri yükle
  Future<RestoreResult> restoreBackup(String filePath) async {
    try {
      final file = File(filePath);
      if (!await file.exists()) {
        return RestoreResult(success: false, message: 'Dosya bulunamadı');
      }

      // ZIP dosyasını oku
      final bytes = await file.readAsBytes();

      // ZIP'i decode et
      final archive = ZipDecoder().decodeBytes(bytes);

      // backup_data.json dosyasını bul
      ArchiveFile? jsonFile;
      for (final file in archive) {
        if (file.name == 'backup_data.json') {
          jsonFile = file;
          break;
        }
      }

      if (jsonFile == null) {
        return RestoreResult(success: false, message: 'Geçersiz yedek dosyası');
      }

      // JSON'u parse et
      final jsonString = utf8.decode(jsonFile.content as List<int>);
      final jsonData = jsonDecode(jsonString) as Map<String, dynamic>;
      final backupData = BackupData.fromJson(jsonData);

      // Verileri geri yükle
      int notesRestored = 0;
      int foldersRestored = 0;

      // Önce klasörleri geri yükle
      for (final folder in backupData.folders) {
        final existingFolder = await _folderDataSource.getFolderById(folder.id);
        if (existingFolder == null) {
          await _folderDataSource.insertFolder(folder);
          foldersRestored++;
        } else {
          await _folderDataSource.updateFolder(folder);
        }
      }

      // Aktif notları geri yükle
      for (final note in backupData.notes) {
        final existingNote = await _noteDataSource.getNoteById(note.id);
        if (existingNote == null) {
          await _noteDataSource.insertNote(note);
          notesRestored++;
        } else {
          await _noteDataSource.updateNote(note);
        }
      }

      // Çöp kutusundaki notları geri yükle
      for (final note in backupData.trashedNotes) {
        final existingNote = await _noteDataSource.getNoteById(note.id);
        if (existingNote == null) {
          await _noteDataSource.insertNote(note);
          notesRestored++;
        } else {
          await _noteDataSource.updateNote(note);
        }
      }

      // Arşivlenmiş notları geri yükle
      for (final note in backupData.archivedNotes) {
        final existingNote = await _noteDataSource.getNoteById(note.id);
        if (existingNote == null) {
          await _noteDataSource.insertNote(note);
          notesRestored++;
        } else {
          await _noteDataSource.updateNote(note);
        }
      }

      // Ayarları geri yükle
      await _restoreSettings(backupData.settings);

      return RestoreResult(
        success: true,
        message: '$notesRestored not ve $foldersRestored klasör geri yüklendi',
        notesRestored: notesRestored,
        foldersRestored: foldersRestored,
      );
    } catch (e) {
      return RestoreResult(success: false, message: 'Geri yükleme hatası: $e');
    }
  }
}

/// Geri yükleme sonucu
class RestoreResult {
  final bool success;
  final String message;
  final int notesRestored;
  final int foldersRestored;

  RestoreResult({
    required this.success,
    required this.message,
    this.notesRestored = 0,
    this.foldersRestored = 0,
  });
}
