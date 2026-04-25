import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:introduction_screen/introduction_screen.dart';
import 'package:epheproject/l10n/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';

/// Onboarding (tanıtım) sayfası
///
/// Uygulamayı ilk kez açan kullanıcılara gösterilir.
class OnboardingPage extends StatelessWidget {
  final VoidCallback onCompleted;

  const OnboardingPage({super.key, required this.onCompleted});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final pageDecoration = PageDecoration(
      titleTextStyle: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: isDark ? AppColors.darkText : AppColors.lightText,
      ),
      bodyTextStyle: TextStyle(
        fontSize: 16,
        color: isDark
            ? AppColors.darkTextSecondary
            : AppColors.lightTextSecondary,
        height: 1.5,
      ),
      bodyPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
      pageColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      imagePadding: const EdgeInsets.only(top: 60),
    );

    return IntroductionScreen(
      pages: [
        // Hoş geldiniz sayfası
        PageViewModel(
          title: l10n.onboardingWelcomeTitle,
          body: l10n.onboardingWelcomeBody,
          image: _buildImage(
            context,
            CupertinoIcons.doc_text_fill,
            AppColors.primary,
          ),
          decoration: pageDecoration,
        ),
        // Organize et sayfası
        PageViewModel(
          title: l10n.onboardingOrganizeTitle,
          body: l10n.onboardingOrganizeBody,
          image: _buildImage(
            context,
            CupertinoIcons.folder_fill,
            const Color(0xFF4ECDC4),
          ),
          decoration: pageDecoration,
        ),
        // Zengin metin sayfası
        PageViewModel(
          title: l10n.onboardingRichTextTitle,
          body: l10n.onboardingRichTextBody,
          image: _buildImage(
            context,
            CupertinoIcons.textformat,
            const Color(0xFFFF6B6B),
          ),
          decoration: pageDecoration,
        ),
        // Güvenlik sayfası
        PageViewModel(
          title: l10n.onboardingSecureTitle,
          body: l10n.onboardingSecureBody,
          image: _buildImage(
            context,
            CupertinoIcons.shield_fill,
            const Color(0xFF6BCB77),
          ),
          decoration: pageDecoration,
        ),
      ],
      onDone: onCompleted,
      onSkip: onCompleted,
      showSkipButton: true,
      skip: Text(
        l10n.skip,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: isDark
              ? AppColors.darkTextSecondary
              : AppColors.lightTextSecondary,
        ),
      ),
      next: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.primary.withAlpha(20),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(CupertinoIcons.arrow_right, color: AppColors.primary),
      ),
      done: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary, AppColors.primary.withBlue(255)],
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(100),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Text(
          l10n.getStarted,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      dotsDecorator: DotsDecorator(
        size: const Size.square(8),
        activeSize: const Size(24, 8),
        activeColor: AppColors.primary,
        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        spacing: const EdgeInsets.symmetric(horizontal: 4),
        activeShape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      globalBackgroundColor: isDark
          ? AppColors.darkBackground
          : AppColors.lightBackground,
      curve: Curves.easeInOut,
      controlsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      animationDuration: 350,
    );
  }

  Widget _buildImage(BuildContext context, IconData icon, Color color) {
    return Center(
      child: Container(
        width: 180,
        height: 180,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color.withAlpha(30), color.withAlpha(60)],
          ),
          borderRadius: BorderRadius.circular(40),
          border: Border.all(color: color.withAlpha(80), width: 2),
          boxShadow: [
            BoxShadow(
              color: color.withAlpha(40),
              blurRadius: 40,
              spreadRadius: 10,
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Arka plan dekoratif elementler
            Positioned(
              top: 20,
              right: 20,
              child: Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: color.withAlpha(40),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            Positioned(
              bottom: 30,
              left: 20,
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: color.withAlpha(50),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            // Ana ikon
            ShaderMask(
              shaderCallback: (bounds) => LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [color, color.withAlpha(200)],
              ).createShader(bounds),
              child: Icon(icon, size: 80, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
