import '../entities/folder.dart';

/// Klasör repository arayüzü (Domain Layer)
///
/// Data layer'dan bağımsız soyut tanım.
/// CRUD işlemlerini tanımlar.
abstract class FolderRepository {
  /// Tüm aktif klasörleri getir
  Future<List<Folder>> getAllFolders();

  /// Silinmiş klasörleri getir (çöp kutusu)
  Future<List<Folder>> getDeletedFolders();

  /// ID'ye göre klasör getir
  Future<Folder?> getFolderById(String id);

  /// Yeni klasör ekle
  Future<void> insertFolder(Folder folder);

  /// Klasör güncelle
  Future<void> updateFolder(Folder folder);

  /// Klasörü çöp kutusuna taşı
  Future<void> moveFolderToTrash(String id);

  /// Klasörü çöp kutusundan geri getir
  Future<void> restoreFolderFromTrash(String id);

  /// Klasörü kalıcı olarak sil
  Future<void> deleteFolder(String id);

  /// Çöp kutusundaki tüm klasörleri kalıcı olarak sil
  Future<void> emptyFolderTrash();

  /// Klasör ara
  Future<List<Folder>> searchFolders(String query);

  /// Klasördeki not sayısını getir
  Future<int> getNoteCountInFolder(String folderId);
}
