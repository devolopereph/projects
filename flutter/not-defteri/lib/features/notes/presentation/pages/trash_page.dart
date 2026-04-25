import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/note.dart';
import '../../domain/entities/folder.dart';
import '../bloc/notes_bloc.dart';
import '../bloc/folders_bloc.dart';
import '../widgets/empty_state.dart';

/// Çöp kutusu sayfası (Notlar ve Klasörler sekmeleri)
class TrashPage extends StatefulWidget {
  const TrashPage({super.key});

  @override
  State<TrashPage> createState() => _TrashPageState();
}

class _TrashPageState extends State<TrashPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // Silinen notları ve klasörleri yükle
    context.read<NotesBloc>().add(const LoadDeletedNotes());
    context.read<FoldersBloc>().add(const LoadDeletedFolders());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          // Çöp kutusundan çıkarken notları ve klasörleri yeniden yükle
          context.read<NotesBloc>().add(const LoadNotes());
          context.read<FoldersBloc>().add(const LoadFolders());
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.trash),
          leading: IconButton(
            icon: const Icon(CupertinoIcons.back),
            onPressed: () {
              context.read<NotesBloc>().add(const LoadNotes());
              context.read<FoldersBloc>().add(const LoadFolders());
              Navigator.of(context).pop();
            },
          ),
          bottom: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: isDark
                ? AppColors.darkTextSecondary
                : AppColors.lightTextSecondary,
            indicatorColor: AppColors.primary,
            tabs: [
              Tab(text: l10n.notesTab),
              Tab(text: l10n.foldersTab),
            ],
          ),
          actions: [
            // Çöp kutusunu boşalt butonu
            _buildEmptyTrashButton(context),
          ],
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildNotesTab(context, isDark),
            _buildFoldersTab(context, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyTrashButton(BuildContext context) {
    return AnimatedBuilder(
      animation: _tabController,
      builder: (context, child) {
        return BlocBuilder<NotesBloc, NotesState>(
          builder: (context, notesState) {
            return BlocBuilder<FoldersBloc, FoldersState>(
              builder: (context, foldersState) {
                final hasDeletedNotes =
                    notesState is TrashLoaded &&
                    notesState.deletedNotes.isNotEmpty;
                final hasDeletedFolders =
                    foldersState is FolderTrashLoaded &&
                    foldersState.deletedFolders.isNotEmpty;

                final showIcon =
                    (_tabController.index == 0 && hasDeletedNotes) ||
                    (_tabController.index == 1 && hasDeletedFolders);

                if (showIcon) {
                  return IconButton(
                    icon: const Icon(CupertinoIcons.trash),
                    onPressed: () {
                      if (_tabController.index == 0) {
                        _showEmptyNotesTrashDialog(context);
                      } else {
                        _showEmptyFoldersTrashDialog(context);
                      }
                    },
                  );
                }
                return const SizedBox.shrink();
              },
            );
          },
        );
      },
    );
  }

  Widget _buildNotesTab(BuildContext context, bool isDark) {
    final l10n = AppLocalizations.of(context)!;

    return BlocBuilder<NotesBloc, NotesState>(
      builder: (context, state) {
        if (state is NotesLoading) {
          return const Center(child: CupertinoActivityIndicator());
        }

        if (state is NotesError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  CupertinoIcons.exclamationmark_circle,
                  size: 64,
                  color: AppColors.error.withAlpha(150),
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.errorOccurred,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  state.message,
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    context.read<NotesBloc>().add(const LoadDeletedNotes());
                  },
                  icon: const Icon(CupertinoIcons.refresh),
                  label: Text(l10n.tryAgain),
                ),
              ],
            ),
          );
        }

        if (state is TrashLoaded) {
          if (state.deletedNotes.isEmpty) {
            return EmptyState(
              icon: CupertinoIcons.trash,
              title: l10n.trashEmpty,
              subtitle: l10n.deletedNotesAppear,
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: state.deletedNotes.length,
            itemBuilder: (context, index) {
              final note = state.deletedNotes[index];
              return _buildTrashNoteCard(context, note, isDark);
            },
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildFoldersTab(BuildContext context, bool isDark) {
    final l10n = AppLocalizations.of(context)!;

    return BlocBuilder<FoldersBloc, FoldersState>(
      builder: (context, state) {
        if (state is FoldersLoading) {
          return const Center(child: CupertinoActivityIndicator());
        }

        if (state is FoldersError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  CupertinoIcons.exclamationmark_circle,
                  size: 64,
                  color: AppColors.error.withAlpha(150),
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.errorOccurred,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  state.message,
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    context.read<FoldersBloc>().add(const LoadDeletedFolders());
                  },
                  icon: const Icon(CupertinoIcons.refresh),
                  label: Text(l10n.tryAgain),
                ),
              ],
            ),
          );
        }

        if (state is FolderTrashLoaded) {
          if (state.deletedFolders.isEmpty) {
            return EmptyState(
              icon: CupertinoIcons.folder,
              title: l10n.noDeletedFolders,
              subtitle: l10n.deletedFoldersAppear,
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: state.deletedFolders.length,
            itemBuilder: (context, index) {
              final folder = state.deletedFolders[index];
              return _buildTrashFolderCard(context, folder, isDark);
            },
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildTrashNoteCard(BuildContext context, Note note, bool isDark) {
    final l10n = AppLocalizations.of(context)!;
    final preview = note.contentPreview;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => _showNoteOptionsSheet(context, note),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(isDark ? 20 : 10),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      CupertinoIcons.trash,
                      size: 16,
                      color: AppColors.error.withAlpha(150),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        note.title.isNotEmpty ? note.title : l10n.untitledNote,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                if (preview.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    preview,
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      CupertinoIcons.clock,
                      size: 14,
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _formatDeletedDate(note.deletedAt, l10n),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTrashFolderCard(
    BuildContext context,
    Folder folder,
    bool isDark,
  ) {
    final l10n = AppLocalizations.of(context)!;
    final folderColor = Color(folder.color);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => _showFolderOptionsSheet(context, folder),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(isDark ? 20 : 10),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Klasör ikonu
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: folderColor.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: folder.hasEmoji
                      ? Center(
                          child: Text(
                            folder.emoji!,
                            style: const TextStyle(fontSize: 28),
                          ),
                        )
                      : Icon(
                          CupertinoIcons.folder_fill,
                          color: folderColor,
                          size: 28,
                        ),
                ),
                const SizedBox(width: 16),
                // Klasör bilgileri
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        folder.name.isNotEmpty
                            ? folder.name
                            : l10n.untitledFolder,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            CupertinoIcons.clock,
                            size: 14,
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.lightTextSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _formatDeletedDate(folder.deletedAt, l10n),
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.lightTextSecondary,
                                ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatDeletedDate(DateTime? date, AppLocalizations l10n) {
    if (date == null) return l10n.unknownDate;

    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return l10n.deletedJustNow;
    } else if (difference.inHours < 1) {
      return l10n.deletedMinutesAgo(difference.inMinutes);
    } else if (difference.inDays < 1) {
      return l10n.deletedHoursAgo(difference.inHours);
    } else if (difference.inDays < 7) {
      return l10n.deletedDaysAgo(difference.inDays);
    } else {
      return l10n.deletedOnDate('${date.day}.${date.month}.${date.year}');
    }
  }

  /// Not seçenekleri bottom sheet
  void _showNoteOptionsSheet(BuildContext context, Note note) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Üst çizgi
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),

                // Not başlığı
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    note.title.isNotEmpty ? note.title : l10n.untitledNote,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 20),

                // Geri Getir
                ListTile(
                  leading: Icon(
                    CupertinoIcons.arrow_counterclockwise,
                    color: AppColors.success,
                  ),
                  title: Text(l10n.restore),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    context.read<NotesBloc>().add(
                      RestoreNoteFromTrash(note.id),
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(l10n.noteRestored),
                        backgroundColor: AppColors.success,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    );
                  },
                ),

                // Kalıcı Olarak Sil
                ListTile(
                  leading: Icon(CupertinoIcons.delete, color: AppColors.error),
                  title: Text(
                    l10n.deletePermanently,
                    style: TextStyle(color: AppColors.error),
                  ),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    _showPermanentDeleteNoteDialog(context, note);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Klasör seçenekleri bottom sheet
  void _showFolderOptionsSheet(BuildContext context, Folder folder) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;
    final folderColor = Color(folder.color);

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Üst çizgi
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),

                // Klasör adı
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: folderColor.withAlpha(30),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: folder.hasEmoji
                            ? Center(
                                child: Text(
                                  folder.emoji!,
                                  style: const TextStyle(fontSize: 22),
                                ),
                              )
                            : Icon(
                                CupertinoIcons.folder_fill,
                                color: folderColor,
                              ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          folder.name.isNotEmpty
                              ? folder.name
                              : l10n.untitledFolder,
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Geri Getir
                ListTile(
                  leading: Icon(
                    CupertinoIcons.arrow_counterclockwise,
                    color: AppColors.success,
                  ),
                  title: Text(l10n.restore),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    context.read<FoldersBloc>().add(
                      RestoreFolderFromTrash(folder.id),
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(l10n.folderRestored),
                        backgroundColor: AppColors.success,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    );
                  },
                ),

                // Kalıcı Olarak Sil
                ListTile(
                  leading: Icon(CupertinoIcons.delete, color: AppColors.error),
                  title: Text(
                    l10n.deletePermanently,
                    style: TextStyle(color: AppColors.error),
                  ),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    _showPermanentDeleteFolderDialog(context, folder);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Not kalıcı silme onay dialogu
  void _showPermanentDeleteNoteDialog(BuildContext context, Note note) {
    final l10n = AppLocalizations.of(context)!;

    showCupertinoDialog(
      context: context,
      builder: (dialogContext) => CupertinoAlertDialog(
        title: Text(l10n.deletePermanently),
        content: Text(
          note.title.isNotEmpty
              ? l10n.deletePermanentlyConfirm(note.title)
              : l10n.deletePermanentlyConfirmUntitled,
        ),
        actions: [
          CupertinoDialogAction(
            child: Text(l10n.cancel),
            onPressed: () => Navigator.of(dialogContext).pop(),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: Text(l10n.delete),
            onPressed: () {
              context.read<NotesBloc>().add(DeleteNote(note.id));
              Navigator.of(dialogContext).pop();
            },
          ),
        ],
      ),
    );
  }

  /// Klasör kalıcı silme onay dialogu
  void _showPermanentDeleteFolderDialog(BuildContext context, Folder folder) {
    final l10n = AppLocalizations.of(context)!;

    showCupertinoDialog(
      context: context,
      builder: (dialogContext) => CupertinoAlertDialog(
        title: Text(l10n.deleteFolderPermanently),
        content: Text(
          folder.name.isNotEmpty
              ? l10n.deleteFolderPermanentlyConfirm(folder.name)
              : l10n.deleteFolderPermanentlyConfirmUntitled,
        ),
        actions: [
          CupertinoDialogAction(
            child: Text(l10n.cancel),
            onPressed: () => Navigator.of(dialogContext).pop(),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: Text(l10n.delete),
            onPressed: () {
              context.read<FoldersBloc>().add(DeleteFolder(folder.id));
              Navigator.of(dialogContext).pop();
            },
          ),
        ],
      ),
    );
  }

  /// Notlar çöp kutusunu boşaltma bottom sheet
  void _showEmptyNotesTrashDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Üst çizgi
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 24),

                // Uyarı ikonu
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.error.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    CupertinoIcons.trash,
                    size: 32,
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(height: 20),

                // Başlık
                Text(
                  l10n.emptyTrash,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Açıklama
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    l10n.emptyTrashConfirm,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 28),

                // Butonlar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      // İptal butonu
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(sheetContext),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: BorderSide(
                              color: isDark
                                  ? AppColors.darkBorder
                                  : AppColors.lightBorder,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(l10n.cancel),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Boşalt butonu
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<NotesBloc>().add(const EmptyTrash());
                            Navigator.pop(sheetContext);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(l10n.emptyTrash),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Klasörler çöp kutusunu boşaltma bottom sheet
  void _showEmptyFoldersTrashDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Üst çizgi
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 24),

                // Uyarı ikonu
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.error.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    CupertinoIcons.folder,
                    size: 32,
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(height: 20),

                // Başlık
                Text(
                  l10n.emptyTrash,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Açıklama
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    l10n.emptyTrashFolders,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 28),

                // Butonlar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      // İptal butonu
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(sheetContext),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: BorderSide(
                              color: isDark
                                  ? AppColors.darkBorder
                                  : AppColors.lightBorder,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(l10n.cancel),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Boşalt butonu
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<FoldersBloc>().add(
                              const EmptyFolderTrash(),
                            );
                            Navigator.pop(sheetContext);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(l10n.emptyTrash),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
