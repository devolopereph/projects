part of 'security_cubit.dart';

/// Güvenlik durumu
class SecurityState extends Equatable {
  final bool isEnabled;
  final bool hasPin;

  const SecurityState({required this.isEnabled, required this.hasPin});

  factory SecurityState.initial() =>
      const SecurityState(isEnabled: false, hasPin: false);

  SecurityState copyWith({bool? isEnabled, bool? hasPin}) {
    return SecurityState(
      isEnabled: isEnabled ?? this.isEnabled,
      hasPin: hasPin ?? this.hasPin,
    );
  }

  @override
  List<Object?> get props => [isEnabled, hasPin];
}
