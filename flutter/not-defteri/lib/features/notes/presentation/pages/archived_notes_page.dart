import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/note.dart';
import '../bloc/notes_bloc.dart';
import '../widgets/note_card.dart';
import '../widgets/empty_state.dart';
import 'note_editor_page.dart';

/// Arşivlenmiş notlar sayfası
class ArchivedNotesPage extends StatefulWidget {
  const ArchivedNotesPage({super.key});

  @override
  State<ArchivedNotesPage> createState() => _ArchivedNotesPageState();
}

class _ArchivedNotesPageState extends State<ArchivedNotesPage> {
  @override
  void initState() {
    super.initState();
    // Arşivlenmiş notları yükle
    context.read<NotesBloc>().add(const LoadArchivedNotes());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          // Sayfadan çıkılırken ana notları yenile
          context.read<NotesBloc>().add(const RefreshNotes());
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.archivedNotes),
          backgroundColor: isDark
              ? AppColors.darkBackground
              : AppColors.lightBackground,
        ),
        body: BlocBuilder<NotesBloc, NotesState>(
          builder: (context, state) {
            if (state is NotesLoading) {
              return const Center(child: CupertinoActivityIndicator());
            }

            if (state is ArchivedNotesLoaded) {
              if (state.archivedNotes.isEmpty) {
                return EmptyState(
                  icon: CupertinoIcons.archivebox,
                  title: l10n.noArchivedNotes,
                  subtitle: l10n.noArchivedNotesDescription,
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.archivedNotes.length,
                itemBuilder: (context, index) {
                  final note = state.archivedNotes[index];
                  return NoteCard(
                    note: note,
                    onTap: () => _navigateToEditor(note),
                    onLongPress: () => _showNoteOptionsSheet(context, note),
                    isGridView: false,
                  );
                },
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  void _navigateToEditor(Note note) async {
    await Navigator.of(context).push(
      CupertinoPageRoute(builder: (context) => NoteEditorPage(note: note)),
    );

    // Sayfa geri dönüldüğünde arşivlenen notları yenile
    if (mounted) {
      context.read<NotesBloc>().add(const LoadArchivedNotes());
    }
  }

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

                // Arşivden Çıkar
                ListTile(
                  leading: Icon(
                    CupertinoIcons.archivebox,
                    color: AppColors.primary,
                  ),
                  title: Text(l10n.unarchive),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    context.read<NotesBloc>().add(UnarchiveNote(note.id));
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
                    _showDeleteConfirmDialog(context, note);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showDeleteConfirmDialog(BuildContext context, Note note) {
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
              // Listeyi yenile
              context.read<NotesBloc>().add(const LoadArchivedNotes());
            },
          ),
        ],
      ),
    );
  }
}
