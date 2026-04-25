import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:uuid/uuid.dart';
import '../../domain/entities/folder.dart';
import '../../domain/repositories/folder_repository.dart';

part 'folders_event.dart';
part 'folders_state.dart';

/// Klasörler için BLoC
///
/// Klasör listesi işlemlerini yönetir:
/// - Yükleme
/// - Ekleme
/// - Güncelleme
/// - Silme (çöp kutusuna taşıma)
/// - Kalıcı silme
/// - Geri getirme
/// - Arama
class FoldersBloc extends Bloc<FoldersEvent, FoldersState> {
  final FolderRepository _repository;
  final Uuid _uuid = const Uuid();

  FoldersBloc(this._repository) : super(FoldersInitial()) {
    on<LoadFolders>(_onLoadFolders);
    on<LoadDeletedFolders>(_onLoadDeletedFolders);
    on<AddFolder>(_onAddFolder);
    on<UpdateFolder>(_onUpdateFolder);
    on<MoveFolderToTrash>(_onMoveFolderToTrash);
    on<RestoreFolderFromTrash>(_onRestoreFolderFromTrash);
    on<DeleteFolder>(_onDeleteFolder);
    on<EmptyFolderTrash>(_onEmptyFolderTrash);
    on<SearchFolders>(_onSearchFolders);
    on<RefreshFolders>(_onRefreshFolders);
  }

  /// Klasörleri yükle
  Future<void> _onLoadFolders(
    LoadFolders event,
    Emitter<FoldersState> emit,
  ) async {
    emit(FoldersLoading());
    try {
      final folders = await _repository.getAllFolders();
      // Her klasör için not sayısını hesapla
      final foldersWithCount = <Folder, int>{};
      for (final folder in folders) {
        final count = await _repository.getNoteCountInFolder(folder.id);
        foldersWithCount[folder] = count;
      }
      emit(FoldersLoaded(folders, foldersWithCount));
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Silinmiş klasörleri yükle
  Future<void> _onLoadDeletedFolders(
    LoadDeletedFolders event,
    Emitter<FoldersState> emit,
  ) async {
    emit(FoldersLoading());
    try {
      final deletedFolders = await _repository.getDeletedFolders();
      emit(FolderTrashLoaded(deletedFolders));
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Yeni klasör ekle
  Future<void> _onAddFolder(AddFolder event, Emitter<FoldersState> emit) async {
    try {
      final folder = Folder(
        id: _uuid.v4(),
        name: event.name,
        color: event.color,
        emoji: event.emoji,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      await _repository.insertFolder(folder);

      // Listeyi yenile
      add(const LoadFolders());
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Klasör güncelle
  Future<void> _onUpdateFolder(
    UpdateFolder event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      final updatedFolder = event.folder.copyWith(updatedAt: DateTime.now());
      await _repository.updateFolder(updatedFolder);

      // Listeyi yenile
      add(const LoadFolders());
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Klasörü çöp kutusuna taşı
  Future<void> _onMoveFolderToTrash(
    MoveFolderToTrash event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      await _repository.moveFolderToTrash(event.id);

      // Listeyi yenile
      add(const LoadFolders());
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Klasörü çöp kutusundan geri getir
  Future<void> _onRestoreFolderFromTrash(
    RestoreFolderFromTrash event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      await _repository.restoreFolderFromTrash(event.id);

      // Çöp kutusu listesini yenile
      add(const LoadDeletedFolders());
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Klasörü kalıcı olarak sil
  Future<void> _onDeleteFolder(
    DeleteFolder event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      await _repository.deleteFolder(event.id);

      // Çöp kutusu listesini yenile
      add(const LoadDeletedFolders());
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Çöp kutusundaki tüm klasörleri sil
  Future<void> _onEmptyFolderTrash(
    EmptyFolderTrash event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      await _repository.emptyFolderTrash();

      // Çöp kutusu listesini yenile
      add(const LoadDeletedFolders());
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Klasörlerde ara
  Future<void> _onSearchFolders(
    SearchFolders event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      final folders = await _repository.searchFolders(event.query);
      final foldersWithCount = <Folder, int>{};
      for (final folder in folders) {
        final count = await _repository.getNoteCountInFolder(folder.id);
        foldersWithCount[folder] = count;
      }
      emit(FoldersLoaded(folders, foldersWithCount, searchQuery: event.query));
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }

  /// Klasörleri yenile
  Future<void> _onRefreshFolders(
    RefreshFolders event,
    Emitter<FoldersState> emit,
  ) async {
    try {
      final folders = await _repository.getAllFolders();
      final foldersWithCount = <Folder, int>{};
      for (final folder in folders) {
        final count = await _repository.getNoteCountInFolder(folder.id);
        foldersWithCount[folder] = count;
      }
      emit(FoldersLoaded(folders, foldersWithCount));
    } catch (e) {
      emit(FoldersError(e.toString()));
    }
  }
}
