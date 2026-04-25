part of 'folders_bloc.dart';

/// Klasör eventleri
abstract class FoldersEvent extends Equatable {
  const FoldersEvent();

  @override
  List<Object?> get props => [];
}

/// Klasörleri yükle
class LoadFolders extends FoldersEvent {
  const LoadFolders();
}

/// Silinmiş klasörleri yükle
class LoadDeletedFolders extends FoldersEvent {
  const LoadDeletedFolders();
}

/// Yeni klasör ekle
class AddFolder extends FoldersEvent {
  final String name;
  final int color;
  final String? emoji;

  const AddFolder(this.name, this.color, {this.emoji});

  @override
  List<Object?> get props => [name, color, emoji];
}

/// Klasör güncelle
class UpdateFolder extends FoldersEvent {
  final Folder folder;

  const UpdateFolder(this.folder);

  @override
  List<Object?> get props => [folder];
}

/// Klasörü çöp kutusuna taşı
class MoveFolderToTrash extends FoldersEvent {
  final String id;

  const MoveFolderToTrash(this.id);

  @override
  List<Object?> get props => [id];
}

/// Klasörü çöp kutusundan geri getir
class RestoreFolderFromTrash extends FoldersEvent {
  final String id;

  const RestoreFolderFromTrash(this.id);

  @override
  List<Object?> get props => [id];
}

/// Klasörü kalıcı olarak sil
class DeleteFolder extends FoldersEvent {
  final String id;

  const DeleteFolder(this.id);

  @override
  List<Object?> get props => [id];
}

/// Çöp kutusundaki tüm klasörleri sil
class EmptyFolderTrash extends FoldersEvent {
  const EmptyFolderTrash();
}

/// Klasörlerde ara
class SearchFolders extends FoldersEvent {
  final String query;

  const SearchFolders(this.query);

  @override
  List<Object?> get props => [query];
}

/// Klasörleri yenile
class RefreshFolders extends FoldersEvent {
  const RefreshFolders();
}
