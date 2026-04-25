part of 'theme_cubit.dart';

/// Tema durumu
class ThemeState extends Equatable {
  final ThemeMode themeMode;

  const ThemeState({required this.themeMode});

  /// Varsayılan durum (light tema)
  factory ThemeState.initial() => const ThemeState(themeMode: ThemeMode.light);

  @override
  List<Object?> get props => [themeMode];
}
