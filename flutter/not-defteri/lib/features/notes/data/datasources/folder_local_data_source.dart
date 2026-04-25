import 'package:sqflite/sqflite.dart';
import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/folder.dart';

/// Klasör veritabanı işlemleri
class FolderLocalDataSource {
  final dynamic _dbHelper;

  FolderLocalDataSource(this._dbHelper);

  /// Tüm aktif klasörleri getir (silinmemişler, güncellenme tarihine göre sıralı)
  Future<List<Folder>> getAllFolders() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      AppConstants.foldersTable,
      where: 'isDeleted = ?',
      whereArgs: [0],
      orderBy: 'updatedAt DESC',
    );
    return maps.map((map) => Folder.fromMap(map)).toList();
  }

  /// Silinmiş klasörleri getir (çöp kutusu)
  Future<List<Folder>> getDeletedFolders() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      AppConstants.foldersTable,
      where: 'isDeleted = ?',
      whereArgs: [1],
      orderBy: 'deletedAt DESC',
    );
    return maps.map((map) => Folder.fromMap(map)).toList();
  }

  /// ID'ye göre klasör getir
  Future<Folder?> getFolderById(String id) async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      AppConstants.foldersTable,
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return Folder.fromMap(maps.first);
  }

  /// Klasör ekle
  Future<void> insertFolder(Folder folder) async {
    final db = await _dbHelper.database;
    await db.insert(
      AppConstants.foldersTable,
      folder.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Klasör güncelle
  Future<void> updateFolder(Folder folder) async {
    final db = await _dbHelper.database;
    await db.update(
      AppConstants.foldersTable,
      folder.toMap(),
      where: 'id = ?',
      whereArgs: [folder.id],
    );
  }

  /// Klasörü çöp kutusuna taşı (soft delete)
  /// Not: Notların folderId'si korunuyor, böylece klasör geri getirildiğinde
  /// notlar tekrar o klasöre bağlanıyor
  Future<void> moveFolderToTrash(String id) async {
    final db = await _dbHelper.database;

    // Klasörü çöp kutusuna taşı
    // Notların folderId'sini DEĞİŞTİRMİYORUZ - geri getirildiğinde tekrar bağlanacaklar
    await db.update(
      AppConstants.foldersTable,
      {'isDeleted': 1, 'deletedAt': DateTime.now().toIso8601String()},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Klasörü çöp kutusundan geri getir
  Future<void> restoreFolderFromTrash(String id) async {
    final db = await _dbHelper.database;
    await db.update(
      AppConstants.foldersTable,
      {'isDeleted': 0, 'deletedAt': null},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Klasörü kalıcı olarak sil
  /// Not: Bu klasördeki notların folderId'si null yapılır
  Future<void> deleteFolder(String id) async {
    final db = await _dbHelper.database;

    // Bu klasördeki notların folderId'sini null yap
    await db.update(
      AppConstants.notesTable,
      {'folderId': null},
      where: 'folderId = ?',
      whereArgs: [id],
    );

    // Klasörü kalıcı olarak sil
    await db.delete(
      AppConstants.foldersTable,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Çöp kutusundaki tüm klasörleri kalıcı olarak sil
  Future<void> emptyFolderTrash() async {
    final db = await _dbHelper.database;
    await db.delete(
      AppConstants.foldersTable,
      where: 'isDeleted = ?',
      whereArgs: [1],
    );
  }

  /// Klasör ara (sadece aktif klasörlerde)
  Future<List<Folder>> searchFolders(String query) async {
    if (query.isEmpty) return getAllFolders();

    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      AppConstants.foldersTable,
      where: 'name LIKE ? AND isDeleted = ?',
      whereArgs: ['%$query%', 0],
      orderBy: 'updatedAt DESC',
    );
    return maps.map((map) => Folder.fromMap(map)).toList();
  }

  /// Klasördeki not sayısını getir (sadece aktif notlar)
  Future<int> getNoteCountInFolder(String folderId) async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM ${AppConstants.notesTable} WHERE folderId = ? AND isDeleted = 0',
      [folderId],
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }
}
