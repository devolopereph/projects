import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:share_plus/share_plus.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../../../core/services/backup_service.dart';
import '../../data/datasources/note_local_data_source.dart';
import '../../data/datasources/folder_local_data_source.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../bloc/notes_bloc.dart';
import '../bloc/folders_bloc.dart';

/// Yedekleme sayfası
class BackupPage extends StatefulWidget {
  const BackupPage({super.key});

  @override
  State<BackupPage> createState() => _BackupPageState();
}

class _BackupPageState extends State<BackupPage> {
  bool _isCreatingBackup = false;
  bool _isRestoringBackup = false;
  String? _statusMessage;
  bool? _isSuccess;

  Future<BackupService> _getBackupService() async {
    final dbHelper = DatabaseHelper.instance;
    final noteDataSource = NoteLocalDataSource(dbHelper);
    final folderDataSource = FolderLocalDataSource(dbHelper);
    final prefs = await SharedPreferences.getInstance();

    return BackupService(
      noteDataSource: noteDataSource,
      folderDataSource: folderDataSource,
      prefs: prefs,
    );
  }

  Future<void> _createBackup() async {
    final l10n = AppLocalizations.of(context)!;

    setState(() {
      _isCreatingBackup = true;
      _statusMessage = null;
      _isSuccess = null;
    });

    try {
      final backupService = await _getBackupService();
      final filePath = await backupService.createBackup();

      // Share Plus ile paylaş
      await Share.shareXFiles([
        XFile(filePath),
      ], subject: l10n.backupFileSubject);

      setState(() {
        _statusMessage = l10n.backupCreatedSuccess;
        _isSuccess = true;
      });
    } catch (e) {
      setState(() {
        _statusMessage = l10n.backupCreatedError(e.toString());
        _isSuccess = false;
      });
    } finally {
      setState(() {
        _isCreatingBackup = false;
      });
    }
  }

  Future<void> _restoreBackup() async {
    final l10n = AppLocalizations.of(context)!;

    setState(() {
      _isRestoringBackup = true;
      _statusMessage = null;
      _isSuccess = null;
    });

    try {
      // Dosya seçiciyi aç
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['zip'],
      );

      if (result == null || result.files.isEmpty) {
        setState(() {
          _isRestoringBackup = false;
        });
        return;
      }

      final filePath = result.files.first.path;
      if (filePath == null) {
        setState(() {
          _statusMessage = l10n.fileNotSelected;
          _isSuccess = false;
          _isRestoringBackup = false;
        });
        return;
      }

      final backupService = await _getBackupService();
      final restoreResult = await backupService.restoreBackup(filePath);

      if (restoreResult.success) {
        // BLoC'ları yenile
        if (mounted) {
          context.read<NotesBloc>().add(const LoadNotes());
          context.read<FoldersBloc>().add(const LoadFolders());
        }

        setState(() {
          _statusMessage = l10n.restoreSuccess(
            restoreResult.notesRestored,
            restoreResult.foldersRestored,
          );
          _isSuccess = true;
        });

        // Uygulamanın yeniden başlatılması gerektiğini bildir
        if (mounted) {
          _showRestartDialog();
        }
      } else {
        setState(() {
          _statusMessage = restoreResult.message;
          _isSuccess = false;
        });
      }
    } catch (e) {
      setState(() {
        _statusMessage = l10n.restoreError(e.toString());
        _isSuccess = false;
      });
    } finally {
      setState(() {
        _isRestoringBackup = false;
      });
    }
  }

  void _showRestartDialog() {
    final l10n = AppLocalizations.of(context)!;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.restoreComplete),
        content: Text(l10n.restartAppMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(l10n.done),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.backup),
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Başlık ve açıklama
              Icon(
                CupertinoIcons.cloud_upload,
                size: 64,
                color: AppColors.primary,
              ),
              const SizedBox(height: 24),
              Text(
                l10n.backupTitle,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                l10n.backupDescription,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // Yedek Oluştur butonu
              _buildActionCard(
                context,
                isDark: isDark,
                icon: CupertinoIcons.arrow_up_doc,
                iconColor: AppColors.primary,
                title: l10n.createBackup,
                subtitle: l10n.createBackupDescription,
                isLoading: _isCreatingBackup,
                onTap: _isCreatingBackup || _isRestoringBackup
                    ? null
                    : _createBackup,
              ),

              const SizedBox(height: 16),

              // Yedeği Geri Yükle butonu
              _buildActionCard(
                context,
                isDark: isDark,
                icon: CupertinoIcons.arrow_down_doc,
                iconColor: AppColors.accent,
                title: l10n.restoreBackup,
                subtitle: l10n.restoreBackupDescription,
                isLoading: _isRestoringBackup,
                onTap: _isCreatingBackup || _isRestoringBackup
                    ? null
                    : _restoreBackup,
              ),

              const SizedBox(height: 24),

              // Durum mesajı
              if (_statusMessage != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _isSuccess == true
                        ? AppColors.success.withAlpha(30)
                        : AppColors.error.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _isSuccess == true
                          ? AppColors.success.withAlpha(100)
                          : AppColors.error.withAlpha(100),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _isSuccess == true
                            ? CupertinoIcons.checkmark_circle_fill
                            : CupertinoIcons.xmark_circle_fill,
                        color: _isSuccess == true
                            ? AppColors.success
                            : AppColors.error,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _statusMessage!,
                          style: TextStyle(
                            color: _isSuccess == true
                                ? AppColors.success
                                : AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              const Spacer(),

              // Alt açıklama
              Text(
                l10n.backupNote,
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required bool isDark,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool isLoading,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: iconColor.withAlpha(30),
                borderRadius: BorderRadius.circular(14),
              ),
              child: isLoading
                  ? Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: iconColor,
                        ),
                      ),
                    )
                  : Icon(icon, color: iconColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                  ),
                ],
              ),
            ),
            Icon(CupertinoIcons.chevron_right, size: 20, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
