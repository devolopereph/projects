import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

part 'security_state.dart';

/// Güvenlik ayarlarını yöneten Cubit
class SecurityCubit extends Cubit<SecurityState> {
  final SharedPreferences _prefs;

  SecurityCubit(this._prefs) : super(SecurityState.initial()) {
    _loadSecuritySettings();
  }

  /// Güvenlik ayarlarını yükle
  void _loadSecuritySettings() {
    final isEnabled = _prefs.getBool(AppConstants.securityEnabledKey) ?? false;
    final storedPin = _prefs.getString(AppConstants.securityPinKey);

    emit(
      SecurityState(
        isEnabled: isEnabled,
        hasPin: storedPin != null && storedPin.isNotEmpty,
      ),
    );
  }

  /// Şifre özelliğinin aktif olup olmadığını kontrol et
  bool get isSecurityEnabled => state.isEnabled;

  /// Şifre olup olmadığını kontrol et
  bool get hasPin => state.hasPin;

  /// Şifreyi doğrula
  bool verifyPin(String pin) {
    final storedPin = _prefs.getString(AppConstants.securityPinKey);
    return storedPin == pin;
  }

  /// Yeni şifre oluştur
  Future<void> createPin(String pin) async {
    await _prefs.setString(AppConstants.securityPinKey, pin);
    await _prefs.setBool(AppConstants.securityEnabledKey, true);
    emit(SecurityState(isEnabled: true, hasPin: true));
  }

  /// Şifreyi değiştir
  Future<void> changePin(String oldPin, String newPin) async {
    if (verifyPin(oldPin)) {
      await _prefs.setString(AppConstants.securityPinKey, newPin);
      emit(SecurityState(isEnabled: true, hasPin: true));
    }
  }

  /// Şifreyi sil
  Future<void> removePin() async {
    await _prefs.remove(AppConstants.securityPinKey);
    await _prefs.setBool(AppConstants.securityEnabledKey, false);
    emit(SecurityState(isEnabled: false, hasPin: false));
  }

  /// Güvenlik özelliğini aç/kapat
  Future<void> toggleSecurity(bool enabled) async {
    if (enabled && state.hasPin) {
      await _prefs.setBool(AppConstants.securityEnabledKey, true);
      emit(state.copyWith(isEnabled: true));
    } else if (!enabled) {
      await _prefs.setBool(AppConstants.securityEnabledKey, false);
      emit(state.copyWith(isEnabled: false));
    }
  }
}
