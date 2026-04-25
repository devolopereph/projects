import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import 'trash_page.dart';
import 'about_page.dart';
import 'language_page.dart';
import 'backup_page.dart';
import 'archived_notes_page.dart';
import 'security_page.dart';

/// Ayarlar sayfası
class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;
    final themeCubit = context.read<ThemeCubit>();

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settings)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Tema ayarları bölümü
          _buildSectionTitle(context, l10n.appearance),
          const SizedBox(height: 12),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.moon_fill,
                iconColor: AppColors.primary,
                title: l10n.darkTheme,
                subtitle: l10n.useDarkTheme,
                trailing: CupertinoSwitch(
                  value: isDark,
                  activeTrackColor: AppColors.primary,
                  onChanged: (_) => themeCubit.toggleTheme(),
                ),
              ),
              _buildDivider(isDark),
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.globe,
                iconColor: AppColors.accent,
                title: l10n.language,
                subtitle: l10n.changeLanguage,
                trailing: const Icon(
                  CupertinoIcons.chevron_right,
                  size: 20,
                  color: Colors.grey,
                ),
                onTap: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute(
                      builder: (context) => const LanguagePage(),
                    ),
                  );
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Veri yönetimi bölümü
          _buildSectionTitle(context, l10n.dataManagement),
          const SizedBox(height: 12),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.archivebox,
                iconColor: AppColors.warning,
                title: l10n.archivedNotes,
                subtitle: l10n.noArchivedNotesDescription,
                trailing: const Icon(
                  CupertinoIcons.chevron_right,
                  size: 20,
                  color: Colors.grey,
                ),
                onTap: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute(
                      builder: (context) => const ArchivedNotesPage(),
                    ),
                  );
                },
              ),
              _buildDivider(isDark),
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.cloud_upload,
                iconColor: AppColors.primary,
                title: l10n.backupAndRestore,
                subtitle: l10n.backupAndRestoreDescription,
                trailing: const Icon(
                  CupertinoIcons.chevron_right,
                  size: 20,
                  color: Colors.grey,
                ),
                onTap: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute(
                      builder: (context) => const BackupPage(),
                    ),
                  );
                },
              ),
              _buildDivider(isDark),
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.trash,
                iconColor: AppColors.error,
                title: l10n.trash,
                subtitle: l10n.viewDeletedNotes,
                trailing: const Icon(
                  CupertinoIcons.chevron_right,
                  size: 20,
                  color: Colors.grey,
                ),
                onTap: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute(builder: (context) => const TrashPage()),
                  );
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Diğer bölümü
          _buildSectionTitle(context, l10n.other),
          const SizedBox(height: 12),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.lock_shield_fill,
                iconColor: AppColors.success,
                title: l10n.security,
                subtitle: l10n.securityDescription,
                trailing: const Icon(
                  CupertinoIcons.chevron_right,
                  size: 20,
                  color: Colors.grey,
                ),
                onTap: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute(
                      builder: (context) => const SecurityPage(),
                    ),
                  );
                },
              ),
              _buildDivider(isDark),
              _buildSettingsItem(
                context,
                icon: CupertinoIcons.info_circle_fill,
                iconColor: AppColors.info,
                title: l10n.about,
                subtitle: l10n.appInfo,
                trailing: const Icon(
                  CupertinoIcons.chevron_right,
                  size: 20,
                  color: Colors.grey,
                ),
                onTap: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute(builder: (context) => const AboutPage()),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _buildSettingsCard(
    BuildContext context,
    bool isDark, {
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(
      height: 1,
      indent: 72,
      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
    );
  }

  Widget _buildSettingsItem(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconColor.withAlpha(30),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 2),
                  Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }
}
