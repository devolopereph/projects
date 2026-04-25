import 'package:epheproject/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_cubit.dart';
import '../../domain/entities/note.dart';
import '../../domain/entities/folder.dart';
import '../bloc/notes_bloc.dart';
import '../bloc/folders_bloc.dart';
import 'note_editor_page.dart';

/// Graf görünümü sayfası - Soy Ağacı Tasarımı
///
/// Notları tarihe göre sıralı şekilde dikey bir soy ağacı yapısında görselleştirir.
/// En yeni not en yukarıda, en eski not en aşağıda konumlanır.
class GraphPage extends StatefulWidget {
  const GraphPage({super.key});

  @override
  State<GraphPage> createState() => _GraphPageState();
}

class _GraphPageState extends State<GraphPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  final TransformationController _transformationController =
      TransformationController();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _transformationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = context.watch<ThemeCubit>().isDark;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.familyTreeView)),
      body: BlocBuilder<FoldersBloc, FoldersState>(
        builder: (context, foldersState) {
          // Klasör haritası oluştur
          final foldersMap = <String, Folder>{};
          if (foldersState is FoldersLoaded) {
            for (final folder in foldersState.folders) {
              foldersMap[folder.id] = folder;
            }
          }

          return BlocBuilder<NotesBloc, NotesState>(
            builder: (context, state) {
              if (state is NotesLoading) {
                return const Center(child: CupertinoActivityIndicator());
              }

              if (state is NotesLoaded) {
                if (state.notes.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          CupertinoIcons.tree,
                          size: 80,
                          color:
                              (isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.lightTextSecondary)
                                  .withAlpha(100),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          l10n.noNotesYet,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          l10n.addNoteToUseFamilyTree,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  );
                }

                // Notları klasörlere göre grupla
                final groupedNotes = _groupNotesByFolder(
                  state.notes,
                  foldersMap,
                );

                return InteractiveViewer(
                  transformationController: _transformationController,
                  minScale: 0.3,
                  maxScale: 3.0,
                  boundaryMargin: const EdgeInsets.all(double.infinity),
                  constrained: false,
                  child: _FamilyTreeViewGrouped(
                    groupedNotes: groupedNotes,
                    foldersMap: foldersMap,
                    isDark: isDark,
                    animationController: _animationController,
                    onNoteTap: (note) => _navigateToEditor(context, note),
                  ),
                );
              }

              return const SizedBox.shrink();
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          final matrix = Matrix4.identity();
          _transformationController.value = matrix;
        },
        child: const Icon(CupertinoIcons.location_fill),
      ),
    );
  }

  /// Notları klasörlere göre grupla
  Map<String?, List<Note>> _groupNotesByFolder(
    List<Note> notes,
    Map<String, Folder> foldersMap,
  ) {
    final grouped = <String?, List<Note>>{};

    for (final note in notes) {
      final folderId = note.folderId;
      if (!grouped.containsKey(folderId)) {
        grouped[folderId] = [];
      }
      grouped[folderId]!.add(note);
    }

    // Her grup içinde tarihe göre sırala
    for (final key in grouped.keys) {
      grouped[key]!.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }

    return grouped;
  }

  void _navigateToEditor(BuildContext context, Note note) {
    Navigator.of(context).push(
      CupertinoPageRoute(builder: (context) => NoteEditorPage(note: note)),
    );
  }
}

/// Klasörlere göre gruplandırılmış soy ağacı görünümü
class _FamilyTreeViewGrouped extends StatelessWidget {
  final Map<String?, List<Note>> groupedNotes;
  final Map<String, Folder> foldersMap;
  final bool isDark;
  final AnimationController animationController;
  final Function(Note) onNoteTap;

  const _FamilyTreeViewGrouped({
    required this.groupedNotes,
    required this.foldersMap,
    required this.isDark,
    required this.animationController,
    required this.onNoteTap,
  });

  // Boyutlar
  static const double folderHeaderWidth = 180.0;
  static const double folderHeaderHeight = 50.0;
  static const double nodeWidth = 160.0;
  static const double nodeHeight = 100.0;
  static const double verticalSpacing = 60.0;
  static const double horizontalSpacing = 220.0;
  static const double topPadding = 40.0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    // Klasörleri sırala: önce klasörü olanlar (adına göre), sonra klasörsüzler
    final sortedKeys = groupedNotes.keys.toList()
      ..sort((a, b) {
        if (a == null && b == null) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        final folderA = foldersMap[a];
        final folderB = foldersMap[b];
        if (folderA == null && folderB == null) return 0;
        if (folderA == null) return 1;
        if (folderB == null) return -1;
        return folderA.name.compareTo(folderB.name);
      });

    // Toplam boyutu hesapla
    int maxNotesInFolder = 0;
    for (final notes in groupedNotes.values) {
      if (notes.length > maxNotesInFolder) {
        maxNotesInFolder = notes.length;
      }
    }

    final totalWidth = sortedKeys.length * horizontalSpacing + 100;
    final totalHeight =
        topPadding +
        folderHeaderHeight +
        verticalSpacing +
        maxNotesInFolder * (nodeHeight + verticalSpacing) +
        100;

    return SizedBox(
      width: totalWidth,
      height: totalHeight,
      child: CustomPaint(
        painter: _FamilyTreeGroupedPainter(
          groupedNotes: groupedNotes,
          sortedKeys: sortedKeys,
          foldersMap: foldersMap,
          isDark: isDark,
          folderHeaderWidth: folderHeaderWidth,
          folderHeaderHeight: folderHeaderHeight,
          nodeWidth: nodeWidth,
          nodeHeight: nodeHeight,
          verticalSpacing: verticalSpacing,
          horizontalSpacing: horizontalSpacing,
          topPadding: topPadding,
        ),
        child: Stack(children: _buildNodes(context, l10n, sortedKeys)),
      ),
    );
  }

  List<Widget> _buildNodes(
    BuildContext context,
    AppLocalizations l10n,
    List<String?> sortedKeys,
  ) {
    final widgets = <Widget>[];
    int totalIndex = 0;

    for (int folderIndex = 0; folderIndex < sortedKeys.length; folderIndex++) {
      final folderId = sortedKeys[folderIndex];
      final notes = groupedNotes[folderId]!;
      final folder = folderId != null ? foldersMap[folderId] : null;

      final x = 50 + folderIndex * horizontalSpacing;

      // Klasör başlığı
      widgets.add(
        AnimatedBuilder(
          animation: animationController,
          builder: (context, child) {
            final delay = folderIndex / (sortedKeys.length + 1) * 0.3;
            final animation = CurvedAnimation(
              parent: animationController,
              curve: Interval(delay, delay + 0.3, curve: Curves.easeOutBack),
            );

            return Positioned(
              left: x,
              top: topPadding,
              child: Transform.scale(
                scale: animation.value.clamp(0.0, 1.2),
                child: Opacity(
                  opacity: animation.value.clamp(0.0, 1.0),
                  child: child,
                ),
              ),
            );
          },
          child: _buildFolderHeader(context, folder, notes.length, l10n),
        ),
      );

      // O klasördeki notlar
      for (int noteIndex = 0; noteIndex < notes.length; noteIndex++) {
        final note = notes[noteIndex];
        final noteY =
            topPadding +
            folderHeaderHeight +
            verticalSpacing +
            noteIndex * (nodeHeight + verticalSpacing);

        widgets.add(
          AnimatedBuilder(
            animation: animationController,
            builder: (context, child) {
              final delay =
                  (totalIndex + noteIndex + 1) /
                  (groupedNotes.values.fold(
                        0,
                        (sum, list) => sum + list.length,
                      ) +
                      sortedKeys.length) *
                  0.6;
              final scaleAnimation = CurvedAnimation(
                parent: animationController,
                curve: Interval(
                  delay,
                  (delay + 0.4).clamp(0.0, 1.0),
                  curve: Curves.easeOutBack,
                ),
              );
              final opacityAnimation = CurvedAnimation(
                parent: animationController,
                curve: Interval(
                  delay,
                  (delay + 0.3).clamp(0.0, 1.0),
                  curve: Curves.easeOut,
                ),
              );

              return Positioned(
                left: x + (folderHeaderWidth - nodeWidth) / 2,
                top: noteY,
                child: Transform.scale(
                  scale: scaleAnimation.value.clamp(0.0, 1.2),
                  child: Opacity(
                    opacity: opacityAnimation.value.clamp(0.0, 1.0),
                    child: child,
                  ),
                ),
              );
            },
            child: _buildNoteNode(context, note),
          ),
        );
      }

      totalIndex += notes.length;
    }

    return widgets;
  }

  Widget _buildFolderHeader(
    BuildContext context,
    Folder? folder,
    int noteCount,
    AppLocalizations l10n,
  ) {
    final color = folder != null ? Color(folder.color) : AppColors.primary;

    return Container(
      width: folderHeaderWidth,
      height: folderHeaderHeight,
      decoration: BoxDecoration(
        color: color.withAlpha(isDark ? 40 : 30),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(100), width: 2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (folder?.emoji != null) ...[
            Text(folder!.emoji!, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 8),
          ] else ...[
            Icon(
              folder != null
                  ? CupertinoIcons.folder_fill
                  : CupertinoIcons.doc_text_fill,
              color: color,
              size: 18,
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Text(
              folder?.name ?? l10n.notes,
              style: TextStyle(
                color: isDark ? Colors.white : Colors.black87,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color.withAlpha(50),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$noteCount',
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoteNode(BuildContext context, Note note) {
    final l10n = AppLocalizations.of(context)!;
    // Renk seçimi - sabit kalması için ID hash kullanılıyor
    final colorIndex = note.id.hashCode.abs() % AppColors.nodeColors.length;
    final color = AppColors.nodeColors[colorIndex];

    return GestureDetector(
      onTap: () => onNoteTap(note),
      child: Container(
        width: nodeWidth,
        height: nodeHeight,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color, color.withAlpha(180)],
          ),
          boxShadow: [
            BoxShadow(
              color: color.withAlpha(60),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(40),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(
                      CupertinoIcons.doc_text_fill,
                      color: Colors.white,
                      size: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      note.title.isNotEmpty ? note.title : l10n.untitledNote,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Row(
                children: [
                  const Icon(
                    CupertinoIcons.time,
                    color: Colors.white70,
                    size: 10,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _formatDate(context, note.createdAt),
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(BuildContext context, DateTime date) {
    return DateFormat(
      'dd MMM yyyy',
      Localizations.localeOf(context).toString(),
    ).format(date);
  }
}

/// Gruplandırılmış soy ağacı çizici
class _FamilyTreeGroupedPainter extends CustomPainter {
  final Map<String?, List<Note>> groupedNotes;
  final List<String?> sortedKeys;
  final Map<String, Folder> foldersMap;
  final bool isDark;
  final double folderHeaderWidth;
  final double folderHeaderHeight;
  final double nodeWidth;
  final double nodeHeight;
  final double verticalSpacing;
  final double horizontalSpacing;
  final double topPadding;

  _FamilyTreeGroupedPainter({
    required this.groupedNotes,
    required this.sortedKeys,
    required this.foldersMap,
    required this.isDark,
    required this.folderHeaderWidth,
    required this.folderHeaderHeight,
    required this.nodeWidth,
    required this.nodeHeight,
    required this.verticalSpacing,
    required this.horizontalSpacing,
    required this.topPadding,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = (isDark ? AppColors.darkBorder : AppColors.lightBorder)
          .withAlpha(150)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    for (int folderIndex = 0; folderIndex < sortedKeys.length; folderIndex++) {
      final folderId = sortedKeys[folderIndex];
      final notes = groupedNotes[folderId]!;
      final folder = folderId != null ? foldersMap[folderId] : null;
      final folderColor = folder != null
          ? Color(folder.color)
          : AppColors.primary;

      final x = 50 + folderIndex * horizontalSpacing + folderHeaderWidth / 2;

      // Folder header'dan ilk nota çizgi
      if (notes.isNotEmpty) {
        final startY = topPadding + folderHeaderHeight;
        final endY = topPadding + folderHeaderHeight + verticalSpacing;

        final gradientPaint = Paint()
          ..shader = LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [folderColor.withAlpha(150), folderColor.withAlpha(50)],
          ).createShader(Rect.fromLTRB(x, startY, x, endY))
          ..strokeWidth = 2
          ..style = PaintingStyle.stroke;

        canvas.drawLine(Offset(x, startY), Offset(x, endY), gradientPaint);
      }

      // Notlar arası çizgiler
      for (int noteIndex = 0; noteIndex < notes.length - 1; noteIndex++) {
        final noteX =
            50 + folderIndex * horizontalSpacing + folderHeaderWidth / 2;
        final noteY1 =
            topPadding +
            folderHeaderHeight +
            verticalSpacing +
            noteIndex * (nodeHeight + verticalSpacing) +
            nodeHeight;
        final noteY2 = noteY1 + verticalSpacing;

        canvas.drawLine(
          Offset(noteX, noteY1),
          Offset(noteX, noteY2),
          linePaint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Soy ağacı görünümü widget'ı (eski versiyon - geriye dönük uyumluluk için)
class _FamilyTreeView extends StatelessWidget {
  final List<Note> notes;
  final bool isDark;
  final AnimationController animationController;
  final Function(Note) onNoteTap;

  const _FamilyTreeView({
    required this.notes,
    required this.isDark,
    required this.animationController,
    required this.onNoteTap,
  });

  // Düğüm boyutları ve aralıkları
  static const double nodeWidth = 160.0;
  static const double nodeHeight = 100.0;
  static const double verticalSpacing = 80.0;
  static const double horizontalPadding = 40.0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final totalHeight =
        notes.length * (nodeHeight + verticalSpacing) + verticalSpacing + 100;
    final totalWidth = nodeWidth + horizontalPadding * 2 + 100;

    return SizedBox(
      width: totalWidth,
      height: totalHeight,
      child: CustomPaint(
        painter: _FamilyTreePainter(
          notes: notes,
          isDark: isDark,
          nodeWidth: nodeWidth,
          nodeHeight: nodeHeight,
          verticalSpacing: verticalSpacing,
          horizontalPadding: horizontalPadding,
        ),
        child: Stack(children: _buildTreeNodes(context, l10n)),
      ),
    );
  }

  List<Widget> _buildTreeNodes(BuildContext context, AppLocalizations l10n) {
    final nodes = <Widget>[];
    final nodeCount = notes.length;

    for (int i = 0; i < nodeCount; i++) {
      final note = notes[i];
      final y = verticalSpacing + i * (nodeHeight + verticalSpacing);
      final x = horizontalPadding + 50;

      nodes.add(
        AnimatedBuilder(
          animation: animationController,
          builder: (context, child) {
            final delay = i / nodeCount * 0.6;
            // Scale için easeOutBack kullan (overshoot destekler)
            final scaleAnimation = CurvedAnimation(
              parent: animationController,
              curve: Interval(delay, delay + 0.4, curve: Curves.easeOutBack),
            );
            // Opacity için easeOut kullan (0-1 arasında kalır)
            final opacityAnimation = CurvedAnimation(
              parent: animationController,
              curve: Interval(delay, delay + 0.3, curve: Curves.easeOut),
            );

            return Positioned(
              left: x,
              top: y,
              child: Transform.scale(
                scale: scaleAnimation.value,
                child: Opacity(
                  opacity: opacityAnimation.value.clamp(0.0, 1.0),
                  child: child,
                ),
              ),
            );
          },
          child: _FamilyTreeNode(
            note: note,
            index: i,
            totalCount: nodeCount,
            isDark: isDark,
            emptyNoteLabel: l10n.emptyNote,
            isNewest: i == 0,
            isOldest: i == nodeCount - 1,
            onTap: () => onNoteTap(note),
          ),
        ),
      );
    }

    return nodes;
  }
}

/// Soy ağacı düğümü widget'ı
class _FamilyTreeNode extends StatelessWidget {
  final Note note;
  final int index;
  final int totalCount;
  final bool isDark;
  final String emptyNoteLabel;
  final bool isNewest;
  final bool isOldest;
  final VoidCallback onTap;

  const _FamilyTreeNode({
    required this.note,
    required this.index,
    required this.totalCount,
    required this.isDark,
    required this.emptyNoteLabel,
    required this.isNewest,
    required this.isOldest,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = AppColors.nodeColors[index % AppColors.nodeColors.length];
    final l10n = AppLocalizations.of(context)!;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: _FamilyTreeView.nodeWidth,
        height: _FamilyTreeView.nodeHeight,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color, color.withAlpha(180)],
          ),
          boxShadow: [
            BoxShadow(
              color: color.withAlpha(60),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: (isDark ? Colors.black : Colors.grey).withAlpha(30),
              blurRadius: 10,
              spreadRadius: 2,
            ),
          ],
          border: isNewest
              ? Border.all(color: Colors.white.withAlpha(100), width: 2)
              : null,
        ),
        child: Stack(
          children: [
            // Düğüm içeriği
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Başlık ve ikon
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(40),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          CupertinoIcons.doc_text_fill,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          note.title.isEmpty ? emptyNoteLabel : note.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Tarih
                  Row(
                    children: [
                      Icon(
                        CupertinoIcons.time,
                        color: Colors.white.withAlpha(180),
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat(
                          'dd MMM yyyy, HH:mm',
                          Localizations.localeOf(context).toString(),
                        ).format(note.createdAt),
                        style: TextStyle(
                          color: Colors.white.withAlpha(180),
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // En yeni veya en eski etiketi
            if (isNewest || isOldest)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: isNewest
                        ? Colors.green.withAlpha(200)
                        : Colors.orange.withAlpha(200),
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(16),
                      bottomLeft: Radius.circular(8),
                    ),
                  ),
                  child: Text(
                    isNewest ? l10n.newest : l10n.oldest,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Soy ağacı bağlantı çizgileri için painter
class _FamilyTreePainter extends CustomPainter {
  final List<Note> notes;
  final bool isDark;
  final double nodeWidth;
  final double nodeHeight;
  final double verticalSpacing;
  final double horizontalPadding;

  _FamilyTreePainter({
    required this.notes,
    required this.isDark,
    required this.nodeWidth,
    required this.nodeHeight,
    required this.verticalSpacing,
    required this.horizontalPadding,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (notes.isEmpty || notes.length < 2) return;

    // Ana bağlantı çizgisi için paint
    final linePaint = Paint()
      ..color = (isDark
          ? AppColors.primary.withAlpha(150)
          : AppColors.primary.withAlpha(120))
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Noktalı efekt için paint
    final dotPaint = Paint()
      ..color = AppColors.primary.withAlpha(100)
      ..style = PaintingStyle.fill;

    // Glow efekti paint
    final glowPaint = Paint()
      ..color = AppColors.primary.withAlpha(30)
      ..strokeWidth = 8.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final centerX = horizontalPadding + 50 + nodeWidth / 2;

    // Her düğüm arasına dikey bağlantı çizgisi çiz
    for (int i = 0; i < notes.length - 1; i++) {
      final y1 =
          verticalSpacing + i * (nodeHeight + verticalSpacing) + nodeHeight;
      final y2 = verticalSpacing + (i + 1) * (nodeHeight + verticalSpacing);

      // Glow efekti
      canvas.drawLine(Offset(centerX, y1), Offset(centerX, y2), glowPaint);

      // Ana çizgi
      canvas.drawLine(Offset(centerX, y1), Offset(centerX, y2), linePaint);

      // Ara noktalar (bağlantı noktaları)
      final midY = (y1 + y2) / 2;
      canvas.drawCircle(Offset(centerX, midY), 4, dotPaint);
    }

    // Düğüm bağlantı noktaları (üst ve alt)
    for (int i = 0; i < notes.length; i++) {
      final y = verticalSpacing + i * (nodeHeight + verticalSpacing);

      // Üst bağlantı noktası (ilk düğüm hariç)
      if (i > 0) {
        canvas.drawCircle(
          Offset(centerX, y),
          5,
          Paint()
            ..color = AppColors.primary
            ..style = PaintingStyle.fill,
        );
        canvas.drawCircle(
          Offset(centerX, y),
          8,
          Paint()
            ..color = AppColors.primary.withAlpha(50)
            ..style = PaintingStyle.fill,
        );
      }

      // Alt bağlantı noktası (son düğüm hariç)
      if (i < notes.length - 1) {
        final bottomY = y + nodeHeight;
        canvas.drawCircle(
          Offset(centerX, bottomY),
          5,
          Paint()
            ..color = AppColors.primary
            ..style = PaintingStyle.fill,
        );
        canvas.drawCircle(
          Offset(centerX, bottomY),
          8,
          Paint()
            ..color = AppColors.primary.withAlpha(50)
            ..style = PaintingStyle.fill,
        );
      }
    }

    // Başlangıç noktası (en yeni not için özel gösterge)
    if (notes.isNotEmpty) {
      final topY = verticalSpacing - 20;

      // Yukarı ok göstergesi
      final arrowPaint = Paint()
        ..color = Colors.green.withAlpha(200)
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final path = Path()
        ..moveTo(centerX, topY)
        ..lineTo(centerX - 8, topY + 10)
        ..moveTo(centerX, topY)
        ..lineTo(centerX + 8, topY + 10);

      canvas.drawPath(path, arrowPaint);
      canvas.drawLine(
        Offset(centerX, topY),
        Offset(centerX, topY + 20),
        arrowPaint,
      );
    }

    // Bitiş noktası (en eski not için özel gösterge)
    if (notes.length > 1) {
      final bottomY =
          verticalSpacing +
          (notes.length - 1) * (nodeHeight + verticalSpacing) +
          nodeHeight +
          20;

      // Aşağı ok göstergesi
      final arrowPaint = Paint()
        ..color = Colors.orange.withAlpha(200)
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      canvas.drawLine(
        Offset(centerX, bottomY - 20),
        Offset(centerX, bottomY),
        arrowPaint,
      );

      final path = Path()
        ..moveTo(centerX, bottomY)
        ..lineTo(centerX - 8, bottomY - 10)
        ..moveTo(centerX, bottomY)
        ..lineTo(centerX + 8, bottomY - 10);

      canvas.drawPath(path, arrowPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _FamilyTreePainter oldDelegate) {
    return oldDelegate.notes != notes || oldDelegate.isDark != isDark;
  }
}
