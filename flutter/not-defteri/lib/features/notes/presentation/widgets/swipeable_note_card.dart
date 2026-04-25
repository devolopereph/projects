import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/note.dart';
import 'note_card.dart';

/// Swipe destekli not kartı widget'ı
///
/// Sola kaydırarak silme, sağa kaydırarak arşivleme yapılabilir.
class SwipeableNoteCard extends StatelessWidget {
  final Note note;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final VoidCallback onDelete;
  final VoidCallback onArchive;
  final bool isGridView;

  const SwipeableNoteCard({
    super.key,
    required this.note,
    required this.onTap,
    required this.onLongPress,
    required this.onDelete,
    required this.onArchive,
    this.isGridView = false,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    // Grid view'da swipe desteklenmez
    if (isGridView) {
      return NoteCard(
        note: note,
        onTap: onTap,
        onLongPress: onLongPress,
        isGridView: true,
      );
    }

    return Dismissible(
      key: Key('note_${note.id}'),
      direction: DismissDirection.horizontal,
      confirmDismiss: (direction) async {
        if (direction == DismissDirection.endToStart) {
          // Sola kaydırma - Silme
          onDelete();
          return false; // AnimasyonsonrasıkartınkalmasınısağlıyoruzçünküonDeletebloc ile listeyi güncelleyecek
        } else if (direction == DismissDirection.startToEnd) {
          // Sağa kaydırma - Arşivleme
          onArchive();
          return false;
        }
        return false;
      },
      background: _buildSwipeBackground(
        context,
        alignment: Alignment.centerLeft,
        color: AppColors.success,
        icon: CupertinoIcons.archivebox_fill,
        label: l10n.archive,
      ),
      secondaryBackground: _buildSwipeBackground(
        context,
        alignment: Alignment.centerRight,
        color: AppColors.error,
        icon: CupertinoIcons.trash_fill,
        label: l10n.delete,
      ),
      child: NoteCard(
        note: note,
        onTap: onTap,
        onLongPress: onLongPress,
        isGridView: false,
      ),
    );
  }

  Widget _buildSwipeBackground(
    BuildContext context, {
    required Alignment alignment,
    required Color color,
    required IconData icon,
    required String label,
  }) {
    final isLeft = alignment == Alignment.centerLeft;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      alignment: alignment,
      padding: EdgeInsets.only(left: isLeft ? 24 : 0, right: isLeft ? 0 : 24),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: isLeft
            ? [
                Icon(icon, color: Colors.white, size: 24),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ]
            : [
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(width: 8),
                Icon(icon, color: Colors.white, size: 24),
              ],
      ),
    );
  }
}
