import '../../domain/entities/folder.dart';
import '../../domain/repositories/folder_repository.dart';
import '../datasources/folder_local_data_source.dart';

/// Klasör repository implementasyonu
///
/// Domain layer'daki abstract repository'nin gerçek implementasyonu.
/// Local data source ile çalışır.
class FolderRepositoryImpl implements FolderRepository {
  final FolderLocalDataSource _localDataSource;

  FolderRepositoryImpl(this._localDataSource);

  @override
  Future<List<Folder>> getAllFolders() async {
    try {
      return await _localDataSource.getAllFolders();
    } catch (e) {
      throw Exception('Klasörler yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Folder>> getDeletedFolders() async {
    try {
      return await _localDataSource.getDeletedFolders();
    } catch (e) {
      throw Exception('Silinmiş klasörler yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<Folder?> getFolderById(String id) async {
    try {
      return await _localDataSource.getFolderById(id);
    } catch (e) {
      throw Exception('Klasör yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> insertFolder(Folder folder) async {
    try {
      await _localDataSource.insertFolder(folder);
    } catch (e) {
      throw Exception('Klasör eklenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> updateFolder(Folder folder) async {
    try {
      await _localDataSource.updateFolder(folder);
    } catch (e) {
      throw Exception('Klasör güncellenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> moveFolderToTrash(String id) async {
    try {
      await _localDataSource.moveFolderToTrash(id);
    } catch (e) {
      throw Exception('Klasör çöp kutusuna taşınırken hata oluştu: $e');
    }
  }

  @override
  Future<void> restoreFolderFromTrash(String id) async {
    try {
      await _localDataSource.restoreFolderFromTrash(id);
    } catch (e) {
      throw Exception('Klasör geri getirilirken hata oluştu: $e');
    }
  }

  @override
  Future<void> deleteFolder(String id) async {
    try {
      await _localDataSource.deleteFolder(id);
    } catch (e) {
      throw Exception('Klasör silinirken hata oluştu: $e');
    }
  }

  @override
  Future<void> emptyFolderTrash() async {
    try {
      await _localDataSource.emptyFolderTrash();
    } catch (e) {
      throw Exception('Klasör çöp kutusu boşaltılırken hata oluştu: $e');
    }
  }

  @override
  Future<List<Folder>> searchFolders(String query) async {
    try {
      return await _localDataSource.searchFolders(query);
    } catch (e) {
      throw Exception('Klasör araması yapılırken hata oluştu: $e');
    }
  }

  @override
  Future<int> getNoteCountInFolder(String folderId) async {
    try {
      return await _localDataSource.getNoteCountInFolder(folderId);
    } catch (e) {
      throw Exception('Not sayısı hesaplanırken hata oluştu: $e');
    }
  }
}
