import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:epheproject/l10n/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/folder.dart';
import '../bloc/folders_bloc.dart';

/// Klasör oluşturma/düzenleme sayfası
class FolderEditorPage extends StatefulWidget {
  /// Düzenleme modu için mevcut klasör
  final Folder? folder;

  const FolderEditorPage({super.key, this.folder});

  @override
  State<FolderEditorPage> createState() => _FolderEditorPageState();
}

class _FolderEditorPageState extends State<FolderEditorPage> {
  late TextEditingController _nameController;
  late int _selectedColor;
  String? _selectedEmoji;
  bool _showEmojiPicker = false;
  bool get _isEditing => widget.folder != null;

  // Klasör renkleri
  static const List<int> _folderColors = [
    0xFF6C63FF, // Primary
    0xFFFF6B6B, // Kırmızı
    0xFF4ECDC4, // Turkuaz
    0xFFFFE66D, // Sarı
    0xFF95E1D3, // Yeşil
    0xFFDDA0DD, // Mor
    0xFFFF8C42, // Turuncu
    0xFF6BCB77, // Açık yeşil
    0xFF4D96FF, // Mavi
    0xFFFF69B4, // Pembe
    0xFF845EC2, // Koyu mor
    0xFFD65DB1, // Magenta
    0xFFFFC75F, // Altın
    0xFF00C9A7, // Teal
    0xFFC34A36, // Kiremit
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.folder?.name ?? '');
    _selectedColor = widget.folder?.color ?? _folderColors[0];
    _selectedEmoji = widget.folder?.emoji;
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _saveFolder() {
    final l10n = AppLocalizations.of(context)!;
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.pleaseEnterFolderName),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (_isEditing) {
      // Düzenleme modu - klasörü güncelle
      final updatedFolder = widget.folder!.copyWith(
        name: name,
        color: _selectedColor,
        emoji: _selectedEmoji,
        clearEmoji: _selectedEmoji == null,
      );
      context.read<FoldersBloc>().add(UpdateFolder(updatedFolder));
    } else {
      // Yeni klasör oluştur
      context.read<FoldersBloc>().add(
        AddFolder(name, _selectedColor, emoji: _selectedEmoji),
      );
    }

    Navigator.of(context).pop(true);
  }

  void _onEmojiSelected(Category? category, Emoji emoji) {
    setState(() {
      _selectedEmoji = emoji.emoji;
      _showEmojiPicker = false;
    });
  }

  void _clearEmoji() {
    setState(() {
      _selectedEmoji = null;
    });
  }

  void _toggleEmojiPicker() {
    setState(() {
      _showEmojiPicker = !_showEmojiPicker;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? l10n.editFolder : l10n.newFolder),
        actions: [
          TextButton(
            onPressed: _saveFolder,
            child: Text(
              l10n.save,
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Klasör önizleme ve emoji seçici
                  Center(
                    child: GestureDetector(
                      onTap: _toggleEmojiPicker,
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Color(_selectedColor).withAlpha(30),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Color(_selectedColor).withAlpha(100),
                            width: 2,
                          ),
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            if (_selectedEmoji != null)
                              Text(
                                _selectedEmoji!,
                                style: const TextStyle(fontSize: 48),
                              )
                            else
                              Icon(
                                CupertinoIcons.folder_fill,
                                size: 50,
                                color: Color(_selectedColor),
                              ),
                            // Edit overlay
                            Positioned(
                              right: 4,
                              bottom: 4,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? AppColors.darkSurface
                                      : AppColors.lightSurface,
                                  borderRadius: BorderRadius.circular(8),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withAlpha(30),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  CupertinoIcons.pencil,
                                  size: 16,
                                  color: Color(_selectedColor),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Emoji silme ve seçme bilgisi
                  Center(
                    child: Column(
                      children: [
                        Text(
                          l10n.tapToSelectEmoji,
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(
                                color: isDark
                                    ? AppColors.darkTextSecondary
                                    : AppColors.lightTextSecondary,
                              ),
                        ),
                        if (_selectedEmoji != null) ...[
                          const SizedBox(height: 8),
                          TextButton.icon(
                            onPressed: _clearEmoji,
                            icon: Icon(
                              CupertinoIcons.xmark_circle,
                              size: 16,
                              color: AppColors.error,
                            ),
                            label: Text(
                              l10n.removeEmoji,
                              style: TextStyle(color: AppColors.error),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Klasör adı
                  Text(
                    l10n.folderName,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _nameController,
                    autofocus: !_isEditing,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: InputDecoration(
                      hintText: l10n.enterFolderName,
                      filled: true,
                      fillColor: isDark
                          ? AppColors.darkSurface
                          : AppColors.lightSurface,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: isDark
                              ? AppColors.darkBorder
                              : AppColors.lightBorder,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: isDark
                              ? AppColors.darkBorder
                              : AppColors.lightBorder,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: AppColors.primary,
                          width: 2,
                        ),
                      ),
                      prefixIcon: _selectedEmoji != null
                          ? Padding(
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                _selectedEmoji!,
                                style: const TextStyle(fontSize: 20),
                              ),
                            )
                          : Icon(
                              CupertinoIcons.folder,
                              color: Color(_selectedColor),
                            ),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 32),

                  // Renk seçimi
                  Text(
                    l10n.selectColor,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildColorGrid(),
                ],
              ),
            ),
          ),
          // Emoji picker
          if (_showEmojiPicker)
            SizedBox(
              height: 300,
              child: EmojiPicker(
                onEmojiSelected: _onEmojiSelected,
                onBackspacePressed: _clearEmoji,
                config: Config(
                  height: 300,
                  checkPlatformCompatibility: true,
                  emojiViewConfig: EmojiViewConfig(
                    emojiSizeMax: 28,
                    columns: 7,
                    backgroundColor: isDark
                        ? AppColors.darkBackground
                        : AppColors.lightBackground,
                  ),
                  categoryViewConfig: CategoryViewConfig(
                    backgroundColor: isDark
                        ? AppColors.darkSurface
                        : AppColors.lightSurface,
                    indicatorColor: AppColors.primary,
                    iconColorSelected: AppColors.primary,
                    iconColor: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                  ),
                  bottomActionBarConfig: BottomActionBarConfig(
                    backgroundColor: isDark
                        ? AppColors.darkSurface
                        : AppColors.lightSurface,
                    buttonColor: AppColors.primary,
                    buttonIconColor: Colors.white,
                  ),
                  searchViewConfig: SearchViewConfig(
                    backgroundColor: isDark
                        ? AppColors.darkSurface
                        : AppColors.lightSurface,
                    buttonIconColor: isDark
                        ? AppColors.darkText
                        : AppColors.lightText,
                    hintText: l10n.searchEmoji,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildColorGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _folderColors.length,
      itemBuilder: (context, index) {
        final color = _folderColors[index];
        final isSelected = _selectedColor == color;

        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedColor = color;
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              color: Color(color),
              borderRadius: BorderRadius.circular(16),
              border: isSelected
                  ? Border.all(color: Colors.white, width: 3)
                  : null,
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: Color(color).withAlpha(150),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ]
                  : null,
            ),
            child: isSelected
                ? const Icon(
                    CupertinoIcons.checkmark,
                    color: Colors.white,
                    size: 24,
                  )
                : null,
          ),
        );
      },
    );
  }
}
