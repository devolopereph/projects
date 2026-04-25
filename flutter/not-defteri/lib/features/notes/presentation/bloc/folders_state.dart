part of 'folders_bloc.dart';

/// Klasör stateleri
abstract class FoldersState extends Equatable {
  const FoldersState();

  @override
  List<Object?> get props => [];
}

/// İlk durum
class FoldersInitial extends FoldersState {}

/// Yükleniyor
class FoldersLoading extends FoldersState {}

/// Klasörler yüklendi
class FoldersLoaded extends FoldersState {
  final List<Folder> folders;
  final Map<Folder, int> folderNoteCounts; // Her klasördeki not sayısı
  final String? searchQuery;

  const FoldersLoaded(this.folders, this.folderNoteCounts, {this.searchQuery});

  @override
  List<Object?> get props => [folders, folderNoteCounts, searchQuery];
}

/// Silinmiş klasörler yüklendi (çöp kutusu)
class FolderTrashLoaded extends FoldersState {
  final List<Folder> deletedFolders;

  const FolderTrashLoaded(this.deletedFolders);

  @override
  List<Object?> get props => [deletedFolders];
}

/// Hata durumu
class FoldersError extends FoldersState {
  final String message;

  const FoldersError(this.message);

  @override
  List<Object?> get props => [message];
}
