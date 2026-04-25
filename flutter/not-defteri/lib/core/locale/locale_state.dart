part of 'locale_cubit.dart';

/// Dil durumu
class LocaleState extends Equatable {
  final Locale locale;

  const LocaleState({required this.locale});

  /// Başlangıç durumu - Türkçe varsayılan
  factory LocaleState.initial() => const LocaleState(locale: Locale('tr'));

  @override
  List<Object> get props => [locale];
}
