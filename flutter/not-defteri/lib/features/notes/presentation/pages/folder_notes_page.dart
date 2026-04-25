import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../../../core/services/notification_service.dart';
import '../../domain/entities/folder.dart';
import '../../domain/entities/note.dart';
import '../../domain/repositories/note_repository.dart';
import '../widgets/note_card.dart';
import '../widgets/empty_state.dart';
import '../bloc/notes_bloc.dart';
import 'note_editor_page.dart';

/// Klasördeki notları gösteren sayfa
class FolderNotesPage extends StatefulWidget {
  final Folder folder;

  const FolderNotesPage({super.key, required this.folder});

  @override
  State<FolderNotesPage> createState() => _FolderNotesPageState();
}

class _FolderNotesPageState extends State<FolderNotesPage> {
  List<Note> _notes = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotes();
  }

  Future<void> _loadNotes() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repository = context.read<NoteRepository>();
      final notes = await repository.getNotesByFolder(widget.folder.id);
      if (mounted) {
        setState(() {
          _notes = notes;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;
    final folderColor = Color(widget.folder.color);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.folder.hasEmoji)
              Text(widget.folder.emoji!, style: const TextStyle(fontSize: 22))
            else
              Icon(CupertinoIcons.folder_fill, color: folderColor, size: 24),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                widget.folder.name.isNotEmpty
                    ? widget.folder.name
                    : l10n.untitledFolder,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
      body: _buildBody(isDark, l10n),
    );
  }

  Widget _buildBody(bool isDark, AppLocalizations l10n) {
    if (_isLoading) {
      return const Center(child: CupertinoActivityIndicator());
    }

    if (_error != null) {
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
              _error!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadNotes,
              icon: const Icon(CupertinoIcons.refresh),
              label: Text(l10n.tryAgain),
            ),
          ],
        ),
      );
    }

    if (_notes.isEmpty) {
      return EmptyState(
        icon: CupertinoIcons.doc_text,
        title: l10n.noNotesInFolder,
        subtitle: l10n.longPressToAdd,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadNotes,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _notes.length,
        itemBuilder: (context, index) {
          final note = _notes[index];
          return NoteCard(
            note: note,
            onTap: () => _navigateToEditor(note),
            onLongPress: () => _showNoteOptionsSheet(note),
            isGridView: false,
          );
        },
      ),
    );
  }

  void _navigateToEditor(Note note) async {
    await Navigator.of(context).push(
      CupertinoPageRoute(builder: (context) => NoteEditorPage(note: note)),
    );
    // Geri döndüğümüzde listeyi yenile
    _loadNotes();
  }

  void _showNoteOptionsSheet(Note note) {
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

                // Klasörden çıkar
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
                    _loadNotes();
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
                      _removeReminder(note);
                    } else {
                      _showReminderPicker(note);
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
                    _loadNotes();
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
                    _showDeleteConfirmDialog(note);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showDeleteConfirmDialog(Note note) {
    final l10n = AppLocalizations.of(context)!;

    showCupertinoDialog(
      context: context,
      builder: (dialogContext) => CupertinoAlertDialog(
        title: Text(l10n.deleteNote),
        content: Text(
          note.title.isNotEmpty
              ? l10n.deleteNoteConfirm(note.title)
              : l10n.deleteNoteConfirmUntitled,
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
              context.read<NotesBloc>().add(MoveNoteToTrash(note.id));
              Navigator.of(dialogContext).pop();
              _loadNotes();
            },
          ),
        ],
      ),
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
  void _removeReminder(Note note) {
    final l10n = AppLocalizations.of(context)!;

    NotificationService().cancelReminder(note.id);
    context.read<NotesBloc>().add(RemoveNoteReminder(note.id));
    _loadNotes();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.reminderRemoved),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Hatırlatıcı seçici göster
  void _showReminderPicker(Note note) async {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.read<ThemeCubit>().isDark;

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

    if (selectedDate == null || !mounted) return;

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

    if (selectedTime == null || !mounted) return;

    final reminderDateTime = DateTime(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      selectedTime.hour,
      selectedTime.minute,
    );

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

    await NotificationService().scheduleReminder(
      noteId: note.id,
      title: l10n.reminderNotification,
      body: l10n.reminderNotificationBody(
        note.title.isNotEmpty ? note.title : l10n.untitledNote,
      ),
      scheduledTime: reminderDateTime,
    );

    if (!mounted) return;

    context.read<NotesBloc>().add(SetNoteReminder(note.id, reminderDateTime));
    _loadNotes();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.reminderSet),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
