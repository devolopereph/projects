import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../../../core/services/notification_service.dart';
import '../../domain/entities/note.dart';
import '../../domain/entities/folder.dart';
import '../bloc/notes_bloc.dart';
import '../bloc/folders_bloc.dart';
import '../widgets/note_card.dart';
import '../widgets/swipeable_note_card.dart';
import '../widgets/empty_state.dart';
import 'note_editor_page.dart';

/// Not listesi sayfası
class NotesListPage extends StatefulWidget {
  const NotesListPage({super.key});

  @override
  State<NotesListPage> createState() => _NotesListPageState();
}

class _NotesListPageState extends State<NotesListPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  bool _isGridView = false;

  @override
  void initState() {
    super.initState();
    _loadViewMode();
  }

  /// Kayıtlı görünüm modunu yükle
  Future<void> _loadViewMode() async {
    final prefs = await SharedPreferences.getInstance();
    final isGrid = prefs.getBool(AppConstants.viewModeKey) ?? false;
    if (mounted) {
      setState(() {
        _isGridView = isGrid;
      });
    }
  }

  /// Görünüm modunu kaydet
  Future<void> _saveViewMode(bool isGrid) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.viewModeKey, isGrid);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return Scaffold(
      body: BlocBuilder<NotesBloc, NotesState>(
        builder: (context, state) {
          return CustomScrollView(
            slivers: [
              SliverAppBar.medium(
                expandedHeight: 120,
                floating: true,
                pinned: true,
                backgroundColor: isDark
                    ? AppColors.darkBackground
                    : AppColors.lightBackground,
                surfaceTintColor: Colors.transparent,
                title: _isSearching
                    ? _buildSearchField(isDark, l10n)
                    : Text(
                        l10n.myNotes,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                actions: [
                  IconButton(
                    icon: Icon(
                      _isGridView
                          ? CupertinoIcons.list_bullet
                          : CupertinoIcons.square_grid_2x2,
                    ),
                    tooltip: _isGridView ? l10n.listView : l10n.gridView,
                    onPressed: () {
                      setState(() {
                        _isGridView = !_isGridView;
                      });
                      _saveViewMode(_isGridView);
                    },
                  ),
                  IconButton(
                    icon: Icon(
                      _isSearching
                          ? CupertinoIcons.xmark
                          : CupertinoIcons.search,
                    ),
                    onPressed: () {
                      setState(() {
                        _isSearching = !_isSearching;
                        if (!_isSearching) {
                          _searchController.clear();
                          context.read<NotesBloc>().add(const RefreshNotes());
                        }
                      });
                    },
                  ),
                ],
              ),

              if (state is NotesLoading)
                const SliverFillRemaining(
                  child: Center(child: CupertinoActivityIndicator()),
                )
              else if (state is NotesError)
                SliverFillRemaining(
                  child: Center(
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
                            context.read<NotesBloc>().add(const LoadNotes());
                          },
                          icon: const Icon(CupertinoIcons.refresh),
                          label: Text(l10n.tryAgain),
                        ),
                      ],
                    ),
                  ),
                )
              else if (state is NotesLoaded)
                if (state.notes.isEmpty)
                  SliverFillRemaining(
                    child: EmptyState(
                      icon: CupertinoIcons.doc_text,
                      title:
                          state.searchQuery != null &&
                              state.searchQuery!.isNotEmpty
                          ? l10n.noResults
                          : l10n.noNotesYet,
                      subtitle:
                          state.searchQuery != null &&
                              state.searchQuery!.isNotEmpty
                          ? l10n.noResultsFor(state.searchQuery!)
                          : l10n.tapToCreate,
                    ),
                  )
                else
                  CupertinoSliverRefreshControl(
                    onRefresh: () async {
                      context.read<NotesBloc>().add(const RefreshNotes());
                    },
                  ),

              if (state is NotesLoaded && state.notes.isNotEmpty)
                SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  sliver: _isGridView
                      ? _buildSliverGrid(state.notes)
                      : _buildSliverList(state.notes),
                ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        heroTag: 'notes_fab',
        onPressed: () {
          _navigateToNewNote(context);
        },
        child: const Icon(CupertinoIcons.add),
      ),
    );
  }

  /// Liste görünümü (Sliver)
  Widget _buildSliverList(List<Note> notes) {
    return SliverList(
      delegate: SliverChildBuilderDelegate((context, index) {
        final note = notes[index];
        return SwipeableNoteCard(
          note: note,
          onTap: () => _navigateToEditor(context, note),
          onLongPress: () => _showNoteOptionsSheet(context, note),
          onDelete: () {
            _showDeleteConfirmSheet(context, note);
          },
          onArchive: () {
            _showArchiveConfirmSheet(context, note);
          },
          isGridView: false,
        );
      }, childCount: notes.length),
    );
  }

  /// Izgara görünümü (Sliver)
  Widget _buildSliverGrid(List<Note> notes) {
    return SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.85,
      ),
      delegate: SliverChildBuilderDelegate((context, index) {
        final note = notes[index];
        return NoteCard(
          note: note,
          onTap: () => _navigateToEditor(context, note),
          onLongPress: () => _showNoteOptionsSheet(context, note),
          isGridView: true,
        );
      }, childCount: notes.length),
    );
  }

  Widget _buildSearchField(bool isDark, AppLocalizations l10n) {
    return TextField(
      controller: _searchController,
      autofocus: true,
      decoration: InputDecoration(
        hintText: l10n.searchNotes,
        border: InputBorder.none,
        hintStyle: TextStyle(
          color: isDark
              ? AppColors.darkTextSecondary
              : AppColors.lightTextSecondary,
        ),
      ),
      style: TextStyle(
        color: isDark ? AppColors.darkText : AppColors.lightText,
      ),
      onChanged: (query) {
        context.read<NotesBloc>().add(SearchNotes(query));
      },
    );
  }

  void _navigateToEditor(BuildContext context, Note note) {
    Navigator.of(context).push(
      CupertinoPageRoute(builder: (context) => NoteEditorPage(note: note)),
    );
  }

  /// Yeni not oluşturmak için düzenleme ekranına git
  void _navigateToNewNote(BuildContext context) {
    Navigator.of(context).push(
      CupertinoPageRoute(
        builder: (context) => const NoteEditorPage(isNewNote: true),
      ),
    );
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

                // Klasöre Taşı
                ListTile(
                  leading: Icon(CupertinoIcons.folder, color: AppColors.accent),
                  title: Text(l10n.moveToFolder),
                  trailing: note.folderId != null
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(30),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            l10n.inFolder,
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.primary,
                            ),
                          ),
                        )
                      : null,
                  onTap: () {
                    Navigator.pop(sheetContext);
                    _showFolderSelectionSheet(context, note);
                  },
                ),

                // Arşivle
                ListTile(
                  leading: Icon(
                    CupertinoIcons.archivebox,
                    color: AppColors.warning,
                  ),
                  title: Text(l10n.archive),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    context.read<NotesBloc>().add(ArchiveNote(note.id));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(l10n.noteArchived),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),

                // Hatırlatıcı Ekle / Kaldır
                ListTile(
                  leading: Icon(
                    note.reminderAt != null
                        ? CupertinoIcons.clock_fill
                        : CupertinoIcons.clock,
                    color: note.reminderAt != null
                        ? AppColors.warning
                        : AppColors.accent,
                  ),
                  title: Text(
                    note.reminderAt != null
                        ? l10n.removeReminder
                        : l10n.addReminder,
                  ),
                  trailing: note.reminderAt != null
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.warning.withAlpha(30),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _formatReminderDateTime(note.reminderAt!, l10n),
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.warning,
                            ),
                          ),
                        )
                      : null,
                  onTap: () {
                    Navigator.pop(sheetContext);
                    if (note.reminderAt != null) {
                      _removeReminder(context, note);
                    } else {
                      _showReminderPicker(context, note);
                    }
                  },
                ),

                // Sabitle / Sabitlemeyi Kaldır
                ListTile(
                  leading: Icon(
                    note.isPinned
                        ? CupertinoIcons.pin_slash
                        : CupertinoIcons.pin,
                    color: AppColors.primary,
                  ),
                  title: Text(note.isPinned ? l10n.unpin : l10n.pin),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    context.read<NotesBloc>().add(
                      ToggleNotePin(note.id, !note.isPinned),
                    );
                  },
                ),

                // Sil
                ListTile(
                  leading: Icon(CupertinoIcons.trash, color: AppColors.error),
                  title: Text(
                    l10n.delete,
                    style: TextStyle(color: AppColors.error),
                  ),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    _showDeleteConfirmSheet(context, note);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Klasör seçim sheet
  void _showFolderSelectionSheet(BuildContext context, Note note) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      isScrollControlled: true,
      builder: (sheetContext) {
        return BlocBuilder<FoldersBloc, FoldersState>(
          builder: (context, state) {
            List<Folder> folders = [];
            if (state is FoldersLoaded) {
              folders = state.folders;
            }

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

                    // Başlık
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        l10n.selectFolder,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w600),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Klasörden Çıkar
                    if (note.folderId != null)
                      ListTile(
                        leading: Icon(
                          CupertinoIcons.folder_badge_minus,
                          color: AppColors.warning,
                        ),
                        title: Text(l10n.removeFromFolder),
                        onTap: () {
                          Navigator.pop(sheetContext);
                          context.read<NotesBloc>().add(
                            UpdateNoteFolder(note.id, null),
                          );
                        },
                      ),

                    // Klasör listesi
                    if (folders.isEmpty)
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            Icon(
                              CupertinoIcons.folder,
                              size: 48,
                              color: isDark
                                  ? AppColors.darkTextSecondary
                                  : AppColors.lightTextSecondary,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              l10n.noFoldersYetCreateInSettings,
                              style: TextStyle(
                                color: isDark
                                    ? AppColors.darkTextSecondary
                                    : AppColors.lightTextSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              l10n.createFolderInSettings,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark
                                    ? AppColors.darkTextSecondary
                                    : AppColors.lightTextSecondary,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    else
                      ConstrainedBox(
                        constraints: BoxConstraints(
                          maxHeight: MediaQuery.of(context).size.height * 0.4,
                        ),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: folders.length,
                          itemBuilder: (context, index) {
                            final folder = folders[index];
                            final isSelected = note.folderId == folder.id;
                            return ListTile(
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Color(folder.color).withAlpha(30),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  CupertinoIcons.folder_fill,
                                  color: Color(folder.color),
                                ),
                              ),
                              title: Text(
                                folder.name.isNotEmpty
                                    ? folder.name
                                    : l10n.untitledFolder,
                              ),
                              trailing: isSelected
                                  ? Icon(
                                      CupertinoIcons.checkmark_circle_fill,
                                      color: AppColors.primary,
                                    )
                                  : null,
                              onTap: () {
                                Navigator.pop(sheetContext);
                                context.read<NotesBloc>().add(
                                  UpdateNoteFolder(note.id, folder.id),
                                );
                              },
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  /// Arşivleme onay bottom sheet
  void _showArchiveConfirmSheet(BuildContext context, Note note) {
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
                // Top Indicator
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

                // Warning Icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.warning.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    CupertinoIcons.archivebox,
                    size: 32,
                    color: AppColors.warning,
                  ),
                ),
                const SizedBox(height: 20),

                // Title
                Text(
                  l10n.archiveNote,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Description
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    note.title.isNotEmpty
                        ? l10n.archiveNoteConfirm(note.title)
                        : l10n.archiveNoteConfirmUntitled,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 28),

                // Buttons
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      // Cancel Button
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
                      // Archive Button
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pop(sheetContext);
                            context.read<NotesBloc>().add(ArchiveNote(note.id));
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(l10n.noteArchived),
                                backgroundColor: AppColors.success,
                                behavior: SnackBarBehavior.floating,
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.warning,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(l10n.archive),
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

  /// Silme onay bottom sheet
  void _showDeleteConfirmSheet(BuildContext context, Note note) {
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
                  l10n.deleteNote,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Açıklama
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    note.title.isNotEmpty
                        ? l10n.deleteNoteConfirm(note.title)
                        : l10n.deleteNoteConfirmUntitled,
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
                      // Sil butonu
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<NotesBloc>().add(
                              MoveNoteToTrash(note.id),
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
                          child: Text(l10n.delete),
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

  /// Hatırlatıcı zaman formatı
  String _formatReminderDateTime(DateTime dateTime, AppLocalizations l10n) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    final reminderDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final timeStr = '$hour:$minute';

    if (reminderDate == today) {
      return '${l10n.today} $timeStr';
    } else if (reminderDate == tomorrow) {
      return '${l10n.tomorrow} $timeStr';
    } else {
      return '${dateTime.day}.${dateTime.month} $timeStr';
    }
  }

  /// Hatırlatıcıyı kaldır
  void _removeReminder(BuildContext context, Note note) {
    final l10n = AppLocalizations.of(context)!;

    // Bildirim servisinden iptal et
    NotificationService().cancelReminder(note.id);

    // Veritabanından kaldır
    context.read<NotesBloc>().add(RemoveNoteReminder(note.id));

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.reminderRemoved),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Hatırlatıcı seçici göster
  void _showReminderPicker(BuildContext context, Note note) async {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;

    // Tarih seç
    final now = DateTime.now();
    final selectedDate = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.primary,
              brightness: isDark ? Brightness.dark : Brightness.light,
            ),
          ),
          child: child!,
        );
      },
    );

    if (selectedDate == null || !context.mounted) return;

    // Saat seç
    final selectedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(now.add(const Duration(hours: 1))),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.primary,
              brightness: isDark ? Brightness.dark : Brightness.light,
            ),
          ),
          child: child!,
        );
      },
    );

    if (selectedTime == null || !context.mounted) return;

    // Tarih ve saati birleştir
    final reminderDateTime = DateTime(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      selectedTime.hour,
      selectedTime.minute,
    );

    // Geçmiş bir zaman seçilmişse hata göster
    if (reminderDateTime.isBefore(DateTime.now())) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.reminderPastError),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    // Bildirim planla
    await NotificationService().scheduleReminder(
      noteId: note.id,
      title: l10n.reminderNotification,
      body: l10n.reminderNotificationBody(
        note.title.isNotEmpty ? note.title : l10n.untitledNote,
      ),
      scheduledTime: reminderDateTime,
    );

    if (!context.mounted) return;

    // Veritabanına kaydet
    context.read<NotesBloc>().add(SetNoteReminder(note.id, reminderDateTime));

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.reminderSet),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
