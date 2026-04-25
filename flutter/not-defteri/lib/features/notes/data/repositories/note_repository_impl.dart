import '../../domain/entities/note.dart';
import '../../domain/repositories/note_repository.dart';
import '../datasources/note_local_data_source.dart';

/// Not repository implementasyonu
///
/// Domain layer'daki abstract repository'nin gerçek implementasyonu.
/// Local data source ile çalışır.
class NoteRepositoryImpl implements NoteRepository {
  final NoteLocalDataSource _localDataSource;

  NoteRepositoryImpl(this._localDataSource);

  @override
  Future<List<Note>> getAllNotes() async {
    try {
      return await _localDataSource.getAllNotes();
    } catch (e) {
      throw Exception('Notlar yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Note>> getDeletedNotes() async {
    try {
      return await _localDataSource.getDeletedNotes();
    } catch (e) {
      throw Exception('Silinen notlar yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<Note?> getNoteById(String id) async {
    try {
      return await _localDataSource.getNoteById(id);
    } catch (e) {
      throw Exception('Not yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> insertNote(Note note) async {
    try {
      await _localDataSource.insertNote(note);
    } catch (e) {
      throw Exception('Not eklenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> updateNote(Note note) async {
    try {
      await _localDataSource.updateNote(note);
    } catch (e) {
      throw Exception('Not güncellenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> moveToTrash(String id) async {
    try {
      await _localDataSource.moveToTrash(id);
    } catch (e) {
      throw Exception('Not çöp kutusuna taşınırken hata oluştu: $e');
    }
  }

  @override
  Future<void> restoreFromTrash(String id) async {
    try {
      await _localDataSource.restoreFromTrash(id);
    } catch (e) {
      throw Exception('Not geri getirilirken hata oluştu: $e');
    }
  }

  @override
  Future<void> deleteNote(String id) async {
    try {
      await _localDataSource.deleteNote(id);
    } catch (e) {
      throw Exception('Not silinirken hata oluştu: $e');
    }
  }

  @override
  Future<void> deleteNotes(List<String> ids) async {
    try {
      await _localDataSource.deleteNotes(ids);
    } catch (e) {
      throw Exception('Notlar silinirken hata oluştu: $e');
    }
  }

  @override
  Future<void> moveMultipleToTrash(List<String> ids) async {
    try {
      await _localDataSource.moveMultipleToTrash(ids);
    } catch (e) {
      throw Exception('Notlar çöp kutusuna taşınırken hata oluştu: $e');
    }
  }

  @override
  Future<void> emptyTrash() async {
    try {
      await _localDataSource.emptyTrash();
    } catch (e) {
      throw Exception('Çöp kutusu boşaltılırken hata oluştu: $e');
    }
  }

  @override
  Future<void> togglePin(String id, bool isPinned) async {
    try {
      await _localDataSource.togglePin(id, isPinned);
    } catch (e) {
      throw Exception('Sabitleme durumu değiştirilirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Note>> searchNotes(String query) async {
    try {
      return await _localDataSource.searchNotes(query);
    } catch (e) {
      throw Exception('Arama yapılırken hata oluştu: $e');
    }
  }

  @override
  Future<void> updateNoteFolder(String noteId, String? folderId) async {
    try {
      await _localDataSource.updateNoteFolder(noteId, folderId);
    } catch (e) {
      throw Exception('Not klasörü güncellenirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Note>> getNotesByFolder(String folderId) async {
    try {
      return await _localDataSource.getNotesByFolder(folderId);
    } catch (e) {
      throw Exception('Klasördeki notlar yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Note>> getNotesWithoutFolder() async {
    try {
      return await _localDataSource.getNotesWithoutFolder();
    } catch (e) {
      throw Exception('Klasörsüz notlar yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Note>> getArchivedNotes() async {
    try {
      return await _localDataSource.getArchivedNotes();
    } catch (e) {
      throw Exception('Arşivlenmiş notlar yüklenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> archiveNote(String id) async {
    try {
      await _localDataSource.archiveNote(id);
    } catch (e) {
      throw Exception('Not arşivlenirken hata oluştu: $e');
    }
  }

  @override
  Future<void> unarchiveNote(String id) async {
    try {
      await _localDataSource.unarchiveNote(id);
    } catch (e) {
      throw Exception('Not arşivden çıkarılırken hata oluştu: $e');
    }
  }

  @override
  Future<void> updateNoteReminder(String noteId, DateTime? reminderAt) async {
    try {
      await _localDataSource.updateNoteReminder(noteId, reminderAt);
    } catch (e) {
      throw Exception('Hatırlatıcı güncellenirken hata oluştu: $e');
    }
  }

  @override
  Future<List<Note>> getNotesWithReminders() async {
    try {
      return await _localDataSource.getNotesWithReminders();
    } catch (e) {
      throw Exception('Hatırlatıcılı notlar yüklenirken hata oluştu: $e');
    }
  }
}
