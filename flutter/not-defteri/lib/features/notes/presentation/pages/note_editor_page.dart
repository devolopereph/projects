import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:appflowy_editor/appflowy_editor.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:intl/intl.dart' hide TextDirection;
import 'package:uuid/uuid.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/note.dart';
import '../bloc/notes_bloc.dart';
import '../widgets/image_gallery_viewer.dart';

/// Not detay ve düzenleme sayfası
///
/// AppFlowy Editor ile zengin metin düzenleme.
/// Otomatik kaydetme özelliği.
/// Varsayılan olarak salt okunur modda açılır.
/// isNewNote: true ise yeni not oluşturma modunda açılır.
class NoteEditorPage extends StatefulWidget {
  final Note? note;
  final bool isNewNote;

  const NoteEditorPage({super.key, this.note, this.isNewNote = false})
    : assert(note != null || isNewNote, 'note veya isNewNote belirtilmeli');

  @override
  State<NoteEditorPage> createState() => _NoteEditorPageState();
}

class _NoteEditorPageState extends State<NoteEditorPage> {
  late TextEditingController _titleController;
  late EditorState _editorState;
  late EditorScrollController _scrollController;

  Timer? _debounceTimer;
  bool _hasChanges = false;
  List<String> _images = [];

  /// Mevcut not (yeni not oluşturulduğunda güncellenir)
  late Note _currentNote;

  /// Yeni not oluşturuldu mu?
  bool _isNewNoteCreated = false;

  /// Düzenleme modu (true) veya salt okunur modu (false)
  bool _isEditing = false;

  /// Arama modu
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();
  List<SearchMatch> _searchMatches = [];
  int _currentMatchIndex = 0;

  final ImagePicker _imagePicker = ImagePicker();

  @override
  void initState() {
    super.initState();

    // Yeni not modu veya mevcut not
    if (widget.isNewNote) {
      _currentNote = Note.empty(const Uuid().v4());
      _isEditing = true; // Yeni notlarda direkt düzenleme modunda başla
      _isNewNoteCreated = false;
    } else {
      _currentNote = widget.note!;
    }

    _titleController = TextEditingController(text: _currentNote.title);
    _images = List.from(_currentNote.images);

    // Editor state'i başlat
    _editorState = _createEditorState();
    _scrollController = EditorScrollController(
      editorState: _editorState,
      shrinkWrap: false,
    );

    // Değişiklikleri dinle
    _titleController.addListener(_onContentChanged);
    _editorState.transactionStream.listen((_) => _onContentChanged());
  }

  EditorState _createEditorState() {
    if (_currentNote.content.isEmpty) {
      return EditorState.blank();
    }

    try {
      final json = jsonDecode(_currentNote.content);
      if (json is Map<String, dynamic>) {
        final document = Document.fromJson(json);
        return EditorState(document: document);
      }
    } catch (e) {
      debugPrint('JSON parse hatası: $e');
    }

    return EditorState.blank();
  }

  @override
  void dispose() {
    _saveNote(); // Son değişiklikleri kaydet
    _debounceTimer?.cancel();
    _titleController.dispose();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onContentChanged() {
    _hasChanges = true;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(AppConstants.autoSaveDebounce, _saveNote);
  }

  void _saveNote() {
    if (!_hasChanges) return;

    final content = jsonEncode(_editorState.document.toJson());

    // İçerik kontrolü - boş not kaydetme
    final hasTitle = _titleController.text.trim().isNotEmpty;
    final hasContent =
        content !=
        '{"document":{"type":"page","children":[{"type":"paragraph","data":{"delta":[]}}]}}';
    final hasImages = _images.isNotEmpty;

    if (!hasTitle && !hasContent && !hasImages) {
      // Boş not, kaydetme
      _hasChanges = false;
      return;
    }

    _currentNote = _currentNote.copyWith(
      title: _titleController.text,
      content: content,
      updatedAt: DateTime.now(),
      images: _images,
    );

    if (widget.isNewNote && !_isNewNoteCreated) {
      // Yeni not oluştur
      context.read<NotesBloc>().add(CreateNoteDirectly(_currentNote));
      _isNewNoteCreated = true;
    } else {
      // Mevcut notu güncelle
      context.read<NotesBloc>().add(UpdateNote(_currentNote));
    }
    _hasChanges = false;
  }

  /// Düzenleme moduna geç
  void _enterEditMode() {
    setState(() {
      _isEditing = true;
      _isSearching = false;
    });
  }

  /// Değişiklikleri kaydedip salt okunur moda dön
  void _saveAndExitEditMode() {
    _saveNote();
    setState(() {
      _isEditing = false;
    });
  }

  /// Arama modunu aç/kapa
  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _searchController.clear();
        _searchMatches.clear();
        _currentMatchIndex = 0;
      }
    });
  }

  /// Not içinde arama yap
  void _performSearch(String query) {
    if (query.isEmpty) {
      setState(() {
        _searchMatches.clear();
        _currentMatchIndex = 0;
      });
      return;
    }

    final matches = <SearchMatch>[];
    final lowerQuery = query.toLowerCase();

    // Başlıkta ara
    final titleLower = _titleController.text.toLowerCase();
    int startIndex = 0;
    while (true) {
      final index = titleLower.indexOf(lowerQuery, startIndex);
      if (index == -1) break;
      matches.add(
        SearchMatch(
          type: SearchMatchType.title,
          startIndex: index,
          length: query.length,
          text: _titleController.text.substring(index, index + query.length),
        ),
      );
      startIndex = index + 1;
    }

    // İçerikte ara
    final fullText = _currentNote.fullTextContent.toLowerCase();
    startIndex = 0;
    while (true) {
      final index = fullText.indexOf(lowerQuery, startIndex);
      if (index == -1) break;
      matches.add(
        SearchMatch(
          type: SearchMatchType.content,
          startIndex: index,
          length: query.length,
          text: _currentNote.fullTextContent.substring(
            index,
            index + query.length,
          ),
        ),
      );
      startIndex = index + 1;
    }

    setState(() {
      _searchMatches = matches;
      _currentMatchIndex = matches.isNotEmpty ? 0 : -1;
    });
  }

  /// Sonraki eşleşmeye git
  void _goToNextMatch() {
    if (_searchMatches.isEmpty) return;
    setState(() {
      _currentMatchIndex = (_currentMatchIndex + 1) % _searchMatches.length;
    });
  }

  /// Önceki eşleşmeye git
  void _goToPreviousMatch() {
    if (_searchMatches.isEmpty) return;
    setState(() {
      _currentMatchIndex =
          (_currentMatchIndex - 1 + _searchMatches.length) %
          _searchMatches.length;
    });
  }

  /// Mobil cihazda mı çalışıyor?
  bool get _isMobile {
    return !kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.iOS ||
            defaultTargetPlatform == TargetPlatform.android);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    // Header widget containing Title, Date/Metadata, and Images
    final headerWidget = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Başlık alanı
        _buildTitleSection(isDark, l10n),

        // Tarih ve Metadata
        if (!_isEditing)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
            child: Row(
              children: [
                Text(
                  _formatDate(_currentNote.updatedAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                  ),
                ),
                if (_currentNote.folderId != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    width: 4,
                    height: 4,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    CupertinoIcons.folder,
                    size: 12,
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                  ),
                ],
              ],
            ),
          ),

        // Görsel ekleri göster
        if (_images.isNotEmpty) _buildImagesSection(isDark),

        const SizedBox(height: 8),
      ],
    );

    return PopScope(
      canPop: widget.isNewNote || !_isEditing,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _isEditing) {
          _saveAndExitEditMode();
        } else if (didPop) {
          _saveNote();
        }
      },
      child: Scaffold(
        backgroundColor: isDark
            ? AppColors.darkBackground
            : AppColors.lightSurface,
        appBar: AppBar(
          backgroundColor: isDark
              ? AppColors.darkBackground
              : AppColors.lightSurface,
          elevation: 0,
          scrolledUnderElevation: 0,
          leading: IconButton(
            icon: Icon(
              CupertinoIcons.back,
              color: isDark ? AppColors.darkText : AppColors.lightText,
            ),
            onPressed: () {
              if (widget.isNewNote) {
                Navigator.of(context).pop();
              } else if (_isEditing) {
                _saveAndExitEditMode();
              } else {
                _saveNote();
                Navigator.of(context).pop();
              }
            },
          ),
          actions: [
            if (_isEditing) ...[
              IconButton(
                icon: Icon(
                  CupertinoIcons.photo,
                  color: isDark ? AppColors.darkText : AppColors.lightText,
                ),
                tooltip: l10n.addPhoto,
                onPressed: _pickImage,
              ),
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: TextButton(
                  onPressed: _saveAndExitEditMode,
                  child: Text(
                    l10n.done,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ] else ...[
              IconButton(
                icon: Icon(
                  _isSearching ? CupertinoIcons.xmark : CupertinoIcons.search,
                  color: isDark ? AppColors.darkText : AppColors.lightText,
                ),
                tooltip: _isSearching
                    ? l10n.closeSearch
                    : l10n.searchInNoteTooltip,
                onPressed: _toggleSearch,
              ),
              IconButton(
                icon: const Icon(CupertinoIcons.pencil),
                tooltip: l10n.edit,
                onPressed: _enterEditMode,
              ),
            ],
          ],
        ),
        body: Column(
          children: [
            if (_isSearching) _buildSearchBar(isDark, l10n),
            Expanded(
              child: _isEditing
                  ? (_isMobile
                        ? _buildMobileEditor(isDark, headerWidget)
                        : _buildDesktopEditor(isDark, headerWidget))
                  : _buildReadOnlyContent(isDark, headerWidget),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd.MM.yyyy HH:mm').format(date);
  }

  /// Arama çubuğu
  Widget _buildSearchBar(bool isDark, AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _searchController,
              autofocus: true,
              decoration: InputDecoration(
                hintText: l10n.searchInNote,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: isDark
                    ? AppColors.darkBackground
                    : AppColors.lightBackground,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                prefixIcon: const Icon(CupertinoIcons.search, size: 20),
              ),
              style: TextStyle(
                color: isDark ? AppColors.darkText : AppColors.lightText,
              ),
              onChanged: _performSearch,
            ),
          ),
          if (_searchMatches.isNotEmpty) ...[
            const SizedBox(width: 8),
            Text(
              '${_currentMatchIndex + 1}/${_searchMatches.length}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            IconButton(
              icon: const Icon(CupertinoIcons.chevron_up, size: 20),
              onPressed: _goToPreviousMatch,
              visualDensity: VisualDensity.compact,
            ),
            IconButton(
              icon: const Icon(CupertinoIcons.chevron_down, size: 20),
              onPressed: _goToNextMatch,
              visualDensity: VisualDensity.compact,
            ),
          ],
        ],
      ),
    );
  }

  /// Başlık bölümü
  Widget _buildTitleSection(bool isDark, AppLocalizations l10n) {
    final highlightedTitle = _getHighlightedTitle(isDark);

    if (_isEditing) {
      // Düzenleme modunda TextField
      return Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
        child: TextField(
          controller: _titleController,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.darkText : AppColors.lightText,
          ),
          decoration: InputDecoration(
            hintText: l10n.title,
            hintStyle: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark
                  ? AppColors.darkTextSecondary.withAlpha(100)
                  : AppColors.lightTextSecondary.withAlpha(100),
            ),
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            filled: false,
            contentPadding: EdgeInsets.zero,
          ),
          maxLines: null,
          textInputAction: TextInputAction.next,
        ),
      );
    } else {
      // Salt okunur modda başlık (arama vurgulamalı)
      return GestureDetector(
        onTap: _enterEditMode,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
          child:
              highlightedTitle ??
              Text(
                _titleController.text.isNotEmpty
                    ? _titleController.text
                    : l10n.untitledNote,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.darkText : AppColors.lightText,
                ),
              ),
        ),
      );
    }
  }

  /// Başlıkta arama vurgulama
  Widget? _getHighlightedTitle(bool isDark) {
    if (!_isSearching || _searchController.text.isEmpty) {
      return null;
    }

    final title = _titleController.text;
    if (title.isEmpty) return null;

    final query = _searchController.text.toLowerCase();
    final titleLower = title.toLowerCase();

    final spans = <TextSpan>[];
    int lastEnd = 0;

    int startIndex = 0;
    while (true) {
      final index = titleLower.indexOf(query, startIndex);
      if (index == -1) break;

      // Eşleşmeden önceki metin
      if (index > lastEnd) {
        spans.add(TextSpan(text: title.substring(lastEnd, index)));
      }

      // Vurgulanan metin
      spans.add(
        TextSpan(
          text: title.substring(index, index + query.length),
          style: TextStyle(
            backgroundColor: AppColors.warning.withAlpha(100),
            color: isDark ? AppColors.darkText : AppColors.lightText,
          ),
        ),
      );

      lastEnd = index + query.length;
      startIndex = index + 1;
    }

    // Kalan metin
    if (lastEnd < title.length) {
      spans.add(TextSpan(text: title.substring(lastEnd)));
    }

    if (spans.isEmpty) return null;

    return RichText(
      text: TextSpan(
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.bold,
          color: isDark ? AppColors.darkText : AppColors.lightText,
        ),
        children: spans,
      ),
    );
  }

  /// Salt okunur içerik görünümü
  Widget _buildReadOnlyContent(bool isDark, Widget? header) {
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;

    final editorStyle = EditorStyle(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      cursorColor: AppColors.primary,
      selectionColor: AppColors.primary.withAlpha(60),
      dragHandleColor: AppColors.primary,
      textStyleConfiguration: TextStyleConfiguration(
        text: TextStyle(fontSize: 16, color: textColor, height: 1.6),
        bold: TextStyle(
          fontSize: 16,
          color: textColor,
          fontWeight: FontWeight.bold,
        ),
        italic: TextStyle(
          fontSize: 16,
          color: textColor,
          fontStyle: FontStyle.italic,
        ),
        underline: TextStyle(
          fontSize: 16,
          color: textColor,
          decoration: TextDecoration.underline,
        ),
        strikethrough: TextStyle(
          fontSize: 16,
          color: textColor,
          decoration: TextDecoration.lineThrough,
        ),
        href: TextStyle(
          fontSize: 16,
          color: AppColors.primary,
          decoration: TextDecoration.underline,
        ),
        code: TextStyle(
          fontSize: 14,
          color: isDark ? AppColors.accent : AppColors.primaryDark,
          fontFamily: 'monospace',
          backgroundColor: isDark
              ? AppColors.darkSurface
              : AppColors.lightBorder,
        ),
      ),
      textSpanDecorator: _isSearching && _searchController.text.isNotEmpty
          ? _highlightSearchResults
          : null,
    );

    // Header'ı ayrı tut, böylece fotoğraflara tıklanabilir olsun
    // Sadece editör içeriğini AbsorbPointer ile sar
    return Column(
      children: [
        // Header - fotoğraflar tıklanabilir
        if (header != null) header,

        // Editör içeriği - tıklanınca düzenleme moduna geç
        Expanded(
          child: GestureDetector(
            onTap: _enterEditMode,
            child: AbsorbPointer(
              child: AppFlowyEditor(
                editorState: _editorState,
                editorScrollController: _scrollController,
                editorStyle: editorStyle,
                footer: const SizedBox(height: 100),
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Arama sonuçlarını vurgula
  InlineSpan _highlightSearchResults(
    BuildContext context,
    Node node,
    int index,
    TextInsert text,
    TextSpan textSpan,
    TextSpan? previousSpan,
  ) {
    if (_searchController.text.isEmpty) return textSpan;

    final query = _searchController.text.toLowerCase();
    final content = text.text.toLowerCase();
    final isDark = this.context.read<ThemeCubit>().isDark;

    final spans = <InlineSpan>[];
    int lastEnd = 0;
    int startIndex = 0;

    while (true) {
      final matchIndex = content.indexOf(query, startIndex);
      if (matchIndex == -1) break;

      // Eşleşmeden önceki metin
      if (matchIndex > lastEnd) {
        spans.add(
          TextSpan(
            text: text.text.substring(lastEnd, matchIndex),
            style: textSpan.style,
          ),
        );
      }

      // Vurgulanan metin
      spans.add(
        TextSpan(
          text: text.text.substring(matchIndex, matchIndex + query.length),
          style:
              textSpan.style?.copyWith(
                backgroundColor: AppColors.warning.withAlpha(100),
              ) ??
              TextStyle(
                backgroundColor: AppColors.warning.withAlpha(100),
                color: isDark ? AppColors.darkText : AppColors.lightText,
              ),
        ),
      );

      lastEnd = matchIndex + query.length;
      startIndex = matchIndex + 1;
    }

    // Kalan metin
    if (lastEnd < text.text.length) {
      spans.add(
        TextSpan(text: text.text.substring(lastEnd), style: textSpan.style),
      );
    }

    if (spans.isEmpty) return textSpan;

    return TextSpan(children: spans);
  }

  Widget _buildImagesSection(bool isDark) {
    return Container(
      height: 100,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: _images.length,
        itemBuilder: (context, index) {
          final imagePath = _images[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              // Fotoğraflara her zaman tıklanabilir - galeri açılır
              onTap: () => _openImageGallery(index),
              behavior: HitTestBehavior
                  .opaque, // Tıklama olayını yakala, parent'a yayılmasını engelle
              child: Stack(
                children: [
                  Hero(
                    tag: 'image_$imagePath',
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        File(imagePath),
                        width: 84,
                        height: 84,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.darkSurface
                                  : AppColors.lightSurface,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              CupertinoIcons.photo,
                              color: AppColors.lightTextSecondary,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  // Silme butonu sadece düzenleme modunda göster
                  if (_isEditing)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _removeImage(index),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: const BoxDecoration(
                            color: Colors.black54,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            CupertinoIcons.xmark,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Tam ekran fotoğraf galerisini aç
  void _openImageGallery(int initialIndex) {
    ImageGalleryViewer.show(context, _images, initialIndex: initialIndex);
  }

  /// Masaüstü için floating toolbar'lı editör
  Widget _buildDesktopEditor(bool isDark, Widget? header) {
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;

    return FloatingToolbar(
      editorState: _editorState,
      editorScrollController: _scrollController,
      textDirection: TextDirection.ltr,
      style: FloatingToolbarStyle(
        backgroundColor: isDark
            ? AppColors.darkSurface
            : AppColors.lightSurface,
        toolbarActiveColor: AppColors.primary,
      ),
      items: [
        paragraphItem,
        ...headingItems,
        ...markdownFormatItems,
        quoteItem,
        bulletedListItem,
        numberedListItem,
        linkItem,
        buildTextColorItem(),
        buildHighlightColorItem(),
      ],
      child: _buildEditorContent(isDark, textColor, header),
    );
  }

  /// Mobil için alt toolbar'lı editör
  Widget _buildMobileEditor(bool isDark, Widget? header) {
    final textColor = isDark ? AppColors.darkText : AppColors.lightText;

    return Column(
      children: [
        // Editör içeriği
        Expanded(child: _buildEditorContent(isDark, textColor, header)),

        // Mobil toolbar - SafeArea ile sarılmış, Android 15/16 yön tuşları çakışmasını önler
        SafeArea(
          top: false,
          child: Theme(
            data: ThemeData.light().copyWith(
              iconTheme: const IconThemeData(color: Colors.black),
              textTheme: ThemeData.light().textTheme.apply(
                bodyColor: Colors.black,
                displayColor: Colors.black,
              ),
            ),
            child: MobileToolbar(
              editorState: _editorState,
              toolbarItems: [
                textDecorationMobileToolbarItem,
                buildTextAndBackgroundColorMobileToolbarItem(),
                headingMobileToolbarItem,
                todoListMobileToolbarItem,
                listMobileToolbarItem,
                linkMobileToolbarItem,
                quoteMobileToolbarItem,
                codeMobileToolbarItem,
              ],
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              outlineColor: Colors.black54,
              itemOutlineColor: Colors.black54,
              primaryColor: AppColors.primary,
              onPrimaryColor: Colors.white,
              tabbarSelectedBackgroundColor: AppColors.primary,
              tabbarSelectedForegroundColor: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  /// Editör içeriği
  Widget _buildEditorContent(bool isDark, Color textColor, Widget? header) {
    final editorStyle = EditorStyle(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      cursorColor: AppColors.primary,
      selectionColor: AppColors.primary.withAlpha(60),
      dragHandleColor: AppColors.primary,
      textStyleConfiguration: TextStyleConfiguration(
        text: TextStyle(fontSize: 16, color: textColor, height: 1.6),
        bold: TextStyle(
          fontSize: 16,
          color: textColor,
          fontWeight: FontWeight.bold,
        ),
        italic: TextStyle(
          fontSize: 16,
          color: textColor,
          fontStyle: FontStyle.italic,
        ),
        underline: TextStyle(
          fontSize: 16,
          color: textColor,
          decoration: TextDecoration.underline,
        ),
        strikethrough: TextStyle(
          fontSize: 16,
          color: textColor,
          decoration: TextDecoration.lineThrough,
        ),
        href: TextStyle(
          fontSize: 16,
          color: AppColors.primary,
          decoration: TextDecoration.underline,
        ),
        code: TextStyle(
          fontSize: 14,
          color: isDark ? AppColors.accent : AppColors.primaryDark,
          fontFamily: 'monospace',
          backgroundColor: isDark
              ? AppColors.darkSurface
              : AppColors.lightBorder,
        ),
      ),
      textSpanDecorator: (context, node, index, text, textSpan, previousSpan) {
        return textSpan;
      },
    );

    return AppFlowyEditor(
      editorState: _editorState,
      editorScrollController: _scrollController,
      editorStyle: editorStyle,
      header: header ?? const SizedBox(height: 8),
      footer: const SizedBox(height: 100),
    );
  }

  Future<void> _pickImage() async {
    final l10n = AppLocalizations.of(context)!;
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        // Dosyayı uygulama dizinine kopyala
        final appDir = await getApplicationDocumentsDirectory();
        final imagesDir = Directory('${appDir.path}/note_images');
        if (!await imagesDir.exists()) {
          await imagesDir.create(recursive: true);
        }

        final fileName =
            '${DateTime.now().millisecondsSinceEpoch}_${p.basename(pickedFile.path)}';
        final newPath = '${imagesDir.path}/$fileName';

        await File(pickedFile.path).copy(newPath);

        setState(() {
          _images.add(newPath);
        });
        _onContentChanged();
      }
    } catch (e) {
      debugPrint('Görsel seçme hatası: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.imageError(e.toString())),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
    });
    _onContentChanged();
  }
}

/// Arama eşleşmesi modeli
class SearchMatch {
  final SearchMatchType type;
  final int startIndex;
  final int length;
  final String text;

  SearchMatch({
    required this.type,
    required this.startIndex,
    required this.length,
    required this.text,
  });
}

/// Arama eşleşme tipi
enum SearchMatchType { title, content }
