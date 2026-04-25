import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../../../core/security/security_cubit.dart';
import 'pin_entry_page.dart';

/// Güvenlik ayarları sayfası
class SecurityPage extends StatefulWidget {
  const SecurityPage({super.key});

  @override
  State<SecurityPage> createState() => _SecurityPageState();
}

class _SecurityPageState extends State<SecurityPage> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.security),
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: BlocBuilder<SecurityCubit, SecurityState>(
        builder: (context, state) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Güvenlik açıklaması
              _buildInfoCard(context, isDark, l10n),
              const SizedBox(height: 24),

              // Şifre ayarları
              _buildSectionTitle(context, l10n.pinSettings),
              const SizedBox(height: 12),
              _buildSettingsCard(
                context,
                isDark,
                children: [
                  if (state.hasPin) ...[
                    // Şifre koruma açık/kapalı
                    _buildSettingsItem(
                      context,
                      icon: CupertinoIcons.lock_shield_fill,
                      iconColor: AppColors.primary,
                      title: l10n.pinLock,
                      subtitle: l10n.pinLockDescription,
                      trailing: CupertinoSwitch(
                        value: state.isEnabled,
                        activeTrackColor: AppColors.primary,
                        onChanged: (value) {
                          context.read<SecurityCubit>().toggleSecurity(value);
                        },
                      ),
                    ),
                    _buildDivider(isDark),
                    // Şifre değiştir
                    _buildSettingsItem(
                      context,
                      icon: CupertinoIcons.pencil_circle_fill,
                      iconColor: AppColors.warning,
                      title: l10n.changePin,
                      subtitle: l10n.changePinDescription,
                      trailing: const Icon(
                        CupertinoIcons.chevron_right,
                        size: 20,
                        color: Colors.grey,
                      ),
                      onTap: () => _navigateToChangePin(),
                    ),
                    _buildDivider(isDark),
                    // Şifreyi kaldır
                    _buildSettingsItem(
                      context,
                      icon: CupertinoIcons.trash_circle_fill,
                      iconColor: AppColors.error,
                      title: l10n.removePin,
                      subtitle: l10n.removePinDescription,
                      trailing: const Icon(
                        CupertinoIcons.chevron_right,
                        size: 20,
                        color: Colors.grey,
                      ),
                      onTap: () => _navigateToRemovePin(),
                    ),
                  ] else ...[
                    // Şifre oluştur
                    _buildSettingsItem(
                      context,
                      icon: CupertinoIcons.lock_circle_fill,
                      iconColor: AppColors.primary,
                      title: l10n.createPin,
                      subtitle: l10n.createPinDescription,
                      trailing: const Icon(
                        CupertinoIcons.chevron_right,
                        size: 20,
                        color: Colors.grey,
                      ),
                      onTap: () => _navigateToCreatePin(),
                    ),
                  ],
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context,
    bool isDark,
    AppLocalizations l10n,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(20),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withAlpha(50)),
      ),
      child: Row(
        children: [
          Icon(
            CupertinoIcons.shield_lefthalf_fill,
            color: AppColors.primary,
            size: 32,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.securityInfo,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.securityInfoDescription,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
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

  /// Şifre oluşturma - Tam ekran sayfa
  Future<void> _navigateToCreatePin() async {
    final l10n = AppLocalizations.of(context)!;

    // İlk şifre girişi
    final pin = await Navigator.of(context).push<String>(
      CupertinoPageRoute(
        builder: (context) =>
            PinEntryPage(title: l10n.createPin, subtitle: l10n.enterNewPin),
      ),
    );

    if (pin == null) return;
    if (!mounted) return;

    // Şifre onaylama
    final confirmedPin = await Navigator.of(context).push<String>(
      CupertinoPageRoute(
        builder: (context) => PinEntryPage(
          title: l10n.confirmPin,
          subtitle: l10n.reenterPin,
          isConfirmation: true,
          pinToConfirm: pin,
        ),
      ),
    );

    if (confirmedPin == null) return;
    if (!mounted) return;

    // Şifreyi kaydet
    await context.read<SecurityCubit>().createPin(confirmedPin);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.pinCreated),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  /// Şifre değiştirme - Tam ekran sayfa
  Future<void> _navigateToChangePin() async {
    final l10n = AppLocalizations.of(context)!;

    // Mevcut şifre doğrulama
    final isVerified = await Navigator.of(context).push<bool>(
      CupertinoPageRoute(
        builder: (context) => PinVerificationPage(
          title: l10n.changePin,
          subtitle: l10n.enterCurrentPin,
        ),
      ),
    );

    if (isVerified != true) return;
    if (!mounted) return;

    // Yeni şifre girişi
    final newPin = await Navigator.of(context).push<String>(
      CupertinoPageRoute(
        builder: (context) =>
            PinEntryPage(title: l10n.newPin, subtitle: l10n.enterNewPin),
      ),
    );

    if (newPin == null) return;
    if (!mounted) return;

    // Yeni şifre onaylama
    final confirmedPin = await Navigator.of(context).push<String>(
      CupertinoPageRoute(
        builder: (context) => PinEntryPage(
          title: l10n.confirmPin,
          subtitle: l10n.reenterPin,
          isConfirmation: true,
          pinToConfirm: newPin,
        ),
      ),
    );

    if (confirmedPin == null) return;
    if (!mounted) return;

    // Yeni şifreyi kaydet
    await context.read<SecurityCubit>().createPin(confirmedPin);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.pinChanged),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  /// Şifre kaldırma - Tam ekran sayfa
  Future<void> _navigateToRemovePin() async {
    final l10n = AppLocalizations.of(context)!;

    // Mevcut şifre doğrulama
    final isVerified = await Navigator.of(context).push<bool>(
      CupertinoPageRoute(
        builder: (context) => PinVerificationPage(
          title: l10n.removePin,
          subtitle: l10n.enterCurrentPin,
        ),
      ),
    );

    if (isVerified != true) return;
    if (!mounted) return;

    // Şifreyi kaldır
    await context.read<SecurityCubit>().removePin();

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.pinRemoved),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}
