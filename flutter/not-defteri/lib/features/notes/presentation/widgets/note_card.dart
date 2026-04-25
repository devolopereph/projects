import 'dart:io';
import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/note.dart';

/// Not kartı widget'ı
class NoteCard extends StatelessWidget {
  final Note note;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final bool isGridView;

  const NoteCard({
    super.key,
    required this.note,
    required this.onTap,
    required this.onLongPress,
    this.isGridView = false,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;
    final preview = note.contentPreview;

    return Padding(
      padding: EdgeInsets.only(bottom: isGridView ? 0 : 12),
      child: GestureDetector(
        onTap: onTap,
        onLongPress: onLongPress,
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: note.isPinned
                  ? AppColors.primary.withAlpha(100)
                  : (isDark ? Colors.transparent : AppColors.lightBorder),
              width: note.isPinned ? 2 : 1,
            ),
            boxShadow: [
              if (!isDark)
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: isGridView
                ? _buildGridContent(context, isDark, preview, l10n)
                : _buildListContent(context, isDark, preview, l10n),
          ),
        ),
      ),
    );
  }

  /// Grid görünümü için içerik
  Widget _buildGridContent(
    BuildContext context,
    bool isDark,
    String preview,
    AppLocalizations l10n,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Pin ikonu ve başlık
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                note.title.isNotEmpty ? note.title : l10n.untitledNote,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (note.isPinned) ...[
              const SizedBox(width: 4),
              Icon(CupertinoIcons.pin_fill, size: 14, color: AppColors.primary),
            ],
          ],
        ),
        const SizedBox(height: 8),
        if (preview.isNotEmpty) ...[
          Expanded(
            child: Text(
              preview,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.lightTextSecondary,
                height: 1.4,
              ),
              maxLines: 8,
              overflow: TextOverflow.fade,
            ),
          ),
        ] else
          const Spacer(),

        const SizedBox(height: 12),
        // Alt bilgi
        Row(
          children: [
            Text(
              _formatDate(note.updatedAt, l10n),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 11,
                color: isDark
                    ? AppColors.darkTextSecondary.withAlpha(150)
                    : AppColors.lightTextSecondary.withAlpha(150),
              ),
            ),
            const Spacer(),
            // Hatırlatıcı göstergesi
            if (note.reminderAt != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _isReminderPast(note.reminderAt!)
                      ? AppColors.error.withAlpha(20)
                      : AppColors.warning.withAlpha(20),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      CupertinoIcons.clock_fill,
                      size: 10,
                      color: _isReminderPast(note.reminderAt!)
                          ? AppColors.error
                          : AppColors.warning,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      _formatReminderTime(note.reminderAt!, l10n),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _isReminderPast(note.reminderAt!)
                            ? AppColors.error
                            : AppColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
            ],
            if (note.images.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      CupertinoIcons.photo,
                      size: 10,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '${note.images.length}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  /// Liste görünümü için içerik
  Widget _buildListContent(
    BuildContext context,
    bool isDark,
    String preview,
    AppLocalizations l10n,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Başlık ve önizleme
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          note.title.isNotEmpty
                              ? note.title
                              : l10n.untitledNote,
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (note.isPinned) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            CupertinoIcons.pin_fill,
                            size: 12,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (preview.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      preview,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.lightTextSecondary,
                        height: 1.5,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),

            // Görsel göstergesi
            if (note.images.isNotEmpty) ...[
              const SizedBox(width: 16),
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(10),
                  borderRadius: BorderRadius.circular(12),
                  // İlk görseli göster
                  image: note.images.isNotEmpty
                      ? DecorationImage(
                          image: FileImage(File(note.images.first)),
                          fit: BoxFit.cover,
                          colorFilter: ColorFilter.mode(
                            Colors.black.withValues(alpha: 0.2),
                            BlendMode.darken,
                          ),
                        )
                      : null,
                ),
                child: note.images.length > 1
                    ? Center(
                        child: Text(
                          '+${note.images.length - 1}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      )
                    : null,
              ),
            ],
          ],
        ),

        const SizedBox(height: 12),

        // Alt bilgi
        Row(
          children: [
            Text(
              _formatDate(note.updatedAt, l10n),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: isDark
                    ? AppColors.darkTextSecondary.withAlpha(150)
                    : AppColors.lightTextSecondary.withAlpha(150),
                fontSize: 12,
              ),
            ),
            if (note.folderId != null) ...[
              const SizedBox(width: 8),
              Container(
                width: 4,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.lightTextSecondary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
            ],
            const Spacer(),
            // Hatırlatıcı göstergesi
            if (note.reminderAt != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _isReminderPast(note.reminderAt!)
                      ? AppColors.error.withAlpha(20)
                      : AppColors.warning.withAlpha(20),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      CupertinoIcons.clock_fill,
                      size: 12,
                      color: _isReminderPast(note.reminderAt!)
                          ? AppColors.error
                          : AppColors.warning,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatReminderTime(note.reminderAt!, l10n),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _isReminderPast(note.reminderAt!)
                            ? AppColors.error
                            : AppColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  String _formatDate(DateTime date, AppLocalizations l10n) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return l10n.justNow;
    } else if (difference.inHours < 1) {
      return l10n.minutesAgo(difference.inMinutes);
    } else if (difference.inDays < 1) {
      return l10n.hoursAgo(difference.inHours);
    } else if (difference.inDays < 7) {
      return l10n.daysAgo(difference.inDays);
    } else {
      return '${date.day}.${date.month}.${date.year}';
    }
  }

  /// Hatırlatıcının geçip geçmediğini kontrol et
  bool _isReminderPast(DateTime reminderAt) {
    return reminderAt.isBefore(DateTime.now());
  }

  /// Hatırlatıcı zamanını formatla
  String _formatReminderTime(DateTime reminderAt, AppLocalizations l10n) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    final reminderDate = DateTime(
      reminderAt.year,
      reminderAt.month,
      reminderAt.day,
    );

    final hour = reminderAt.hour.toString().padLeft(2, '0');
    final minute = reminderAt.minute.toString().padLeft(2, '0');
    final timeStr = '$hour:$minute';

    if (reminderDate == today) {
      return '${l10n.today} $timeStr';
    } else if (reminderDate == tomorrow) {
      return '${l10n.tomorrow} $timeStr';
    } else {
      return '${reminderAt.day}.${reminderAt.month} $timeStr';
    }
  }
}
