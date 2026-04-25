import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;

/// Bildirim servisi
///
/// Hatırlatıcı bildirimleri zamanlamak ve iptal etmek için kullanılır.
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;

  /// Bildirim servisini başlat
  Future<void> initialize() async {
    if (_isInitialized) return;

    // Timezone verilerini yükle
    tz_data.initializeTimeZones();

    // Android ayarları
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS ayarları
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    // Başlatma ayarları
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    _isInitialized = true;
  }

  /// Bildirime tıklandığında
  void _onNotificationTapped(NotificationResponse response) {
    // Bildirime tıklandığında yapılacak işlemler
    // Not: Burada navigation yapılabilir
  }

  /// Bildirim izni iste
  Future<bool> requestPermission() async {
    // Android 13+ için izin iste
    final androidPlugin =
        _notifications.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin != null) {
      final granted = await androidPlugin.requestNotificationsPermission();
      return granted ?? false;
    }

    // iOS için izin iste
    final iosPlugin =
        _notifications.resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>();
    if (iosPlugin != null) {
      final granted = await iosPlugin.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return granted ?? false;
    }

    return true;
  }

  /// Hatırlatıcı bildirimi zamanla
  Future<void> scheduleReminder({
    required String noteId,
    required String title,
    required String body,
    required DateTime scheduledTime,
  }) async {
    if (!_isInitialized) await initialize();

    // Geçmiş bir zaman için bildirim zamanlanamaz
    if (scheduledTime.isBefore(DateTime.now())) return;

    // Not ID'sinden benzersiz bir bildirim ID'si oluştur
    final notificationId = noteId.hashCode;

    // Android bildirim detayları
    const androidDetails = AndroidNotificationDetails(
      'reminder_channel',
      'Hatırlatıcılar',
      channelDescription: 'Not hatırlatıcı bildirimleri',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    // iOS bildirim detayları
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Bildirimi zamanla
    await _notifications.zonedSchedule(
      id: notificationId,
      title: title,
      body: body,
      scheduledDate: tz.TZDateTime.from(scheduledTime, tz.local),
      notificationDetails: notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  /// Hatırlatıcı bildirimini iptal et
  Future<void> cancelReminder(String noteId) async {
    if (!_isInitialized) await initialize();

    final notificationId = noteId.hashCode;
    await _notifications.cancel(id: notificationId);
  }

  /// Tüm bildirimleri iptal et
  Future<void> cancelAllReminders() async {
    if (!_isInitialized) await initialize();
    await _notifications.cancelAll();
  }

  /// Bekleyen bildirimleri getir
  Future<List<PendingNotificationRequest>> getPendingReminders() async {
    if (!_isInitialized) await initialize();
    return await _notifications.pendingNotificationRequests();
  }
}
