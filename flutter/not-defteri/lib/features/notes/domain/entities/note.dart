import 'dart:convert';
import 'package:equatable/equatable.dart';

/// Not modeli
///
/// Her not benzersiz bir ID'ye sahiptir ve başlık, içerik,
/// oluşturulma/güncellenme tarihleri ve görsel listesi içerir.
class Note extends Equatable {
  final String id;
  final String title;
  final String content; // AppFlowy Editor JSON formatında saklanır
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> images; // Görsel dosya yolları
  final bool isPinned; // Sabitleme durumu
  final bool isDeleted; // Çöp kutusunda mı?
  final DateTime? deletedAt; // Silinme tarihi
  final String? folderId; // Ait olduğu klasör ID'si (null = klasörsüz)
  final bool isArchived; // Arşivlenmiş mi?
  final DateTime? reminderAt; // Hatırlatıcı zamanı

  const Note({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
    this.images = const [],
    this.isPinned = false,
    this.isDeleted = false,
    this.deletedAt,
    this.folderId,
    this.isArchived = false,
    this.reminderAt,
  });

  /// Boş not oluştur
  factory Note.empty(String id) {
    final now = DateTime.now();
    return Note(
      id: id,
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
      images: [],
      isPinned: false,
      isDeleted: false,
      deletedAt: null,
      folderId: null,
      isArchived: false,
      reminderAt: null,
    );
  }

  /// JSON'dan Note oluştur
  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      images: _parseImages(json['images']),
      isPinned: json['isPinned'] == 1 || json['isPinned'] == true,
      isDeleted: json['isDeleted'] == 1 || json['isDeleted'] == true,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
      folderId: json['folderId'] as String?,
      isArchived: json['isArchived'] == 1 || json['isArchived'] == true,
      reminderAt: json['reminderAt'] != null
          ? DateTime.parse(json['reminderAt'] as String)
          : null,
    );
  }

  /// Görsel listesini parse et
  static List<String> _parseImages(dynamic images) {
    if (images == null) return [];
    if (images is List) {
      return images.map((e) => e.toString()).toList();
    }
    if (images is String && images.isNotEmpty) {
      try {
        final decoded = jsonDecode(images);
        if (decoded is List) {
          return decoded.map((e) => e.toString()).toList();
        }
      } catch (_) {}
    }
    return [];
  }

  /// Note'u JSON'a dönüştür
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'images': jsonEncode(images),
      'isPinned': isPinned ? 1 : 0,
      'isDeleted': isDeleted ? 1 : 0,
      'deletedAt': deletedAt?.toIso8601String(),
      'reminderAt': reminderAt?.toIso8601String(),
      'folderId': folderId,
      'isArchived': isArchived ? 1 : 0,
    };
  }

  /// Veritabanı için Map'e dönüştür
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'images': jsonEncode(images),
      'isPinned': isPinned ? 1 : 0,
      'isDeleted': isDeleted ? 1 : 0,
      'deletedAt': deletedAt?.toIso8601String(),
      'folderId': folderId,
      'isArchived': isArchived ? 1 : 0,
      'reminderAt': reminderAt?.toIso8601String(),
    };
  }

  /// Veritabanından Note oluştur
  factory Note.fromMap(Map<String, dynamic> map) {
    return Note(
      id: map['id'] as String,
      title: map['title'] as String? ?? '',
      content: map['content'] as String? ?? '',
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
      images: _parseImages(map['images']),
      isPinned: map['isPinned'] == 1 || map['isPinned'] == true,
      isDeleted: map['isDeleted'] == 1 || map['isDeleted'] == true,
      deletedAt: map['deletedAt'] != null
          ? DateTime.parse(map['deletedAt'] as String)
          : null,
      folderId: map['folderId'] as String?,
      isArchived: map['isArchived'] == 1 || map['isArchived'] == true,
      reminderAt: map['reminderAt'] != null
          ? DateTime.parse(map['reminderAt'] as String)
          : null,
    );
  }

  /// Not kopyası oluştur (güncellemeler için)
  Note copyWith({
    String? id,
    String? title,
    String? content,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<String>? images,
    bool? isPinned,
    bool? isDeleted,
    DateTime? deletedAt,
    String? folderId,
    bool? isArchived,
    DateTime? reminderAt,
    bool clearReminder = false,
  }) {
    return Note(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      images: images ?? this.images,
      isPinned: isPinned ?? this.isPinned,
      isDeleted: isDeleted ?? this.isDeleted,
      deletedAt: deletedAt ?? this.deletedAt,
      folderId: folderId ?? this.folderId,
      isArchived: isArchived ?? this.isArchived,
      reminderAt: clearReminder ? null : (reminderAt ?? this.reminderAt),
    );
  }

  /// Not boş mu?
  bool get isEmpty => title.isEmpty && content.isEmpty;

  /// Not dolu mu?
  bool get isNotEmpty => !isEmpty;

  /// İçerik önizlemesi (plain text)
  String get contentPreview {
    if (content.isEmpty) return '';

    try {
      // AppFlowy Editor JSON'dan düz metin çıkar
      final decoded = jsonDecode(content);
      if (decoded is Map && decoded.containsKey('document')) {
        final document = decoded['document'];
        if (document is Map && document.containsKey('children')) {
          final children = document['children'] as List;
          final buffer = StringBuffer();
          for (final child in children) {
            if (child is Map) {
              _extractText(child, buffer);
            }
          }
          final text = buffer.toString().trim();
          return text.length > 100 ? '${text.substring(0, 100)}...' : text;
        }
      }
    } catch (_) {}

    // JSON değilse direkt döndür
    return content.length > 100 ? '${content.substring(0, 100)}...' : content;
  }

  /// Tam metin içeriği (arama için)
  String get fullTextContent {
    if (content.isEmpty) return '';

    try {
      final decoded = jsonDecode(content);
      if (decoded is Map && decoded.containsKey('document')) {
        final document = decoded['document'];
        if (document is Map && document.containsKey('children')) {
          final children = document['children'] as List;
          final buffer = StringBuffer();
          for (final child in children) {
            if (child is Map) {
              _extractText(child, buffer);
            }
          }
          return buffer.toString().trim();
        }
      }
    } catch (_) {}

    return content;
  }

  /// Recursive olarak metin çıkar
  static void _extractText(Map<dynamic, dynamic> node, StringBuffer buffer) {
    // Check direct delta
    if (node.containsKey('delta')) {
      final delta = node['delta'] as List?;
      if (delta != null) {
        for (final op in delta) {
          if (op is Map && op.containsKey('insert')) {
            buffer.write(op['insert']);
          }
        }
        buffer.write(' ');
      }
    }

    // Check data['delta'] (AppFlowy Editor structure)
    if (node.containsKey('data')) {
      final data = node['data'];
      if (data is Map && data.containsKey('delta')) {
        final delta = data['delta'] as List?;
        if (delta != null) {
          for (final op in delta) {
            if (op is Map && op.containsKey('insert')) {
              buffer.write(op['insert']);
            }
          }
          buffer.write(' ');
        }
      }
    }

    if (node.containsKey('children')) {
      final children = node['children'] as List?;
      if (children != null) {
        for (final child in children) {
          if (child is Map) {
            _extractText(child, buffer);
          }
        }
      }
    }
  }

  @override
  List<Object?> get props => [
    id,
    title,
    content,
    createdAt,
    updatedAt,
    images,
    isPinned,
    isDeleted,
    deletedAt,
    folderId,
    isArchived,
    reminderAt,
  ];
}
