import 'package:equatable/equatable.dart';

/// Klasör modeli
///
/// Her klasör benzersiz bir ID'ye sahiptir ve notları gruplamak için kullanılır.
class Folder extends Equatable {
  final String id;
  final String name;
  final int color; // Renk int olarak saklanır (Flutter Color value)
  final String?
  emoji; // Klasör için emoji ikonu (nullable - mevcut kullanıcılar için)
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isDeleted; // Çöp kutusunda mı?
  final DateTime? deletedAt; // Silinme tarihi

  const Folder({
    required this.id,
    required this.name,
    required this.color,
    this.emoji,
    required this.createdAt,
    required this.updatedAt,
    this.isDeleted = false,
    this.deletedAt,
  });

  /// Boş klasör oluştur
  factory Folder.empty(String id) {
    final now = DateTime.now();
    return Folder(
      id: id,
      name: '',
      color: 0xFF6C63FF, // Varsayılan renk (primary)
      emoji: null,
      createdAt: now,
      updatedAt: now,
    );
  }

  /// JSON'dan Folder oluştur
  factory Folder.fromJson(Map<String, dynamic> json) {
    return Folder(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      color: json['color'] as int? ?? 0xFF6C63FF,
      emoji: json['emoji'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isDeleted: json['isDeleted'] == 1 || json['isDeleted'] == true,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
    );
  }

  /// Folder'u JSON'a dönüştür
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'emoji': emoji,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDeleted': isDeleted ? 1 : 0,
      'deletedAt': deletedAt?.toIso8601String(),
    };
  }

  /// Veritabanı için Map'e dönüştür
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'emoji': emoji,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDeleted': isDeleted ? 1 : 0,
      'deletedAt': deletedAt?.toIso8601String(),
    };
  }

  /// Veritabanından Folder oluştur
  factory Folder.fromMap(Map<String, dynamic> map) {
    return Folder(
      id: map['id'] as String,
      name: map['name'] as String? ?? '',
      color: map['color'] as int? ?? 0xFF6C63FF,
      emoji: map['emoji'] as String?,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
      isDeleted: map['isDeleted'] == 1 || map['isDeleted'] == true,
      deletedAt: map['deletedAt'] != null
          ? DateTime.parse(map['deletedAt'] as String)
          : null,
    );
  }

  /// Klasör kopyası oluştur (güncellemeler için)
  Folder copyWith({
    String? id,
    String? name,
    int? color,
    String? emoji,
    bool clearEmoji = false,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDeleted,
    DateTime? deletedAt,
    bool clearDeletedAt = false,
  }) {
    return Folder(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      emoji: clearEmoji ? null : (emoji ?? this.emoji),
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      deletedAt: clearDeletedAt ? null : (deletedAt ?? this.deletedAt),
    );
  }

  /// Klasör boş mu?
  bool get isEmpty => name.isEmpty;

  /// Klasör dolu mu?
  bool get isNotEmpty => !isEmpty;

  /// Emoji var mı?
  bool get hasEmoji => emoji != null && emoji!.isNotEmpty;

  @override
  List<Object?> get props => [
    id,
    name,
    color,
    emoji,
    createdAt,
    updatedAt,
    isDeleted,
    deletedAt,
  ];
}
