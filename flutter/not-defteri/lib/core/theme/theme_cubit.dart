import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:equatable/equatable.dart';
import '../constants/app_constants.dart';

part 'theme_state.dart';

/// Tema yönetimi için Cubit
class ThemeCubit extends Cubit<ThemeState> {
  final SharedPreferences _prefs;

  ThemeCubit(this._prefs) : super(ThemeState.initial()) {
    _loadTheme();
  }

  /// Kayıtlı tema tercihini yükle
  void _loadTheme() {
    bool isDark = false;
    try {
      // Eski kayıtlarda farklı tip olabilir, güvenli okuma yap
      final value = _prefs.get(AppConstants.themeKey);
      if (value is bool) {
        isDark = value;
      } else if (value != null) {
        // Eski değer farklı tipte, temizle
        _prefs.remove(AppConstants.themeKey);
      }
    } catch (e) {
      // Hata durumunda varsayılan değer kullan
      isDark = false;
    }
    emit(ThemeState(themeMode: isDark ? ThemeMode.dark : ThemeMode.light));
  }

  /// Temayı değiştir
  void toggleTheme() {
    final newMode = state.themeMode == ThemeMode.dark
        ? ThemeMode.light
        : ThemeMode.dark;

    _prefs.setBool(AppConstants.themeKey, newMode == ThemeMode.dark);
    emit(ThemeState(themeMode: newMode));
  }

  /// Belirli bir tema modunu ayarla
  void setThemeMode(ThemeMode mode) {
    _prefs.setBool(AppConstants.themeKey, mode == ThemeMode.dark);
    emit(ThemeState(themeMode: mode));
  }

  /// Temayı dark olarak ayarla
  bool get isDark => state.themeMode == ThemeMode.dark;
}
