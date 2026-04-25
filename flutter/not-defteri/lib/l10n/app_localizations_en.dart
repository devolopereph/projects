// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Not Defteri';

  @override
  String get notes => 'Notes';

  @override
  String get folders => 'Folders';

  @override
  String get graph => 'Graph';

  @override
  String get settings => 'Settings';

  @override
  String get myNotes => 'My Notes';

  @override
  String get searchNotes => 'Search notes...';

  @override
  String get searchFolders => 'Search folders...';

  @override
  String get searchInNote => 'Search in note...';

  @override
  String get noResults => 'No results found';

  @override
  String noResultsFor(String query) {
    return 'No results found for \"$query\"';
  }

  @override
  String get noNotesYet => 'No notes yet';

  @override
  String get tapToCreate => 'Tap + button to create your first note';

  @override
  String get noFoldersYet => 'No folders yet';

  @override
  String get tapToCreateFolder => 'Tap + button to create your first folder';

  @override
  String get untitledNote => 'Untitled note';

  @override
  String get untitledFolder => 'Untitled folder';

  @override
  String get title => 'Title';

  @override
  String get done => 'Done';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';

  @override
  String get delete => 'Delete';

  @override
  String get edit => 'Edit';

  @override
  String get addPhoto => 'Add Photo';

  @override
  String get searchInNoteTooltip => 'Search in Note';

  @override
  String get closeSearch => 'Close Search';

  @override
  String get pin => 'Pin';

  @override
  String get unpin => 'Unpin';

  @override
  String get moveToFolder => 'Move to Folder';

  @override
  String get removeFromFolder => 'Remove from Folder';

  @override
  String get selectFolder => 'Select Folder';

  @override
  String get inFolder => 'In folder';

  @override
  String get deleteNote => 'Delete Note';

  @override
  String deleteNoteConfirm(String title) {
    return 'Are you sure you want to delete \"$title\"?\n\nThe note will be moved to trash.';
  }

  @override
  String get deleteNoteConfirmUntitled =>
      'Are you sure you want to delete this note?\n\nThe note will be moved to trash.';

  @override
  String get appearance => 'Appearance';

  @override
  String get darkTheme => 'Dark Theme';

  @override
  String get useDarkTheme => 'Use dark theme';

  @override
  String get language => 'Language';

  @override
  String get changeLanguage => 'Change app language';

  @override
  String get selectLanguage => 'Select Language';

  @override
  String get english => 'English';

  @override
  String get turkish => 'Turkish';

  @override
  String get dataManagement => 'Data Management';

  @override
  String get trash => 'Trash';

  @override
  String get viewDeletedNotes => 'View deleted notes';

  @override
  String get other => 'Other';

  @override
  String get about => 'About';

  @override
  String get appInfo => 'App information';

  @override
  String version(String version) {
    return 'Version $version';
  }

  @override
  String versionWithBuild(String version, String buildNumber) {
    return 'Version $version ($buildNumber)';
  }

  @override
  String get loadingVersion => 'Loading version...';

  @override
  String get richTextNotesApp => 'Rich text notes application';

  @override
  String get trashEmpty => 'Trash is empty';

  @override
  String get deletedNotesAppear => 'Deleted notes will appear here';

  @override
  String get emptyTrash => 'Empty Trash';

  @override
  String get emptyTrashConfirm =>
      'Are you sure you want to permanently delete all notes in the trash?\n\nThis action cannot be undone.';

  @override
  String get restore => 'Restore';

  @override
  String get noteRestored => 'Note restored';

  @override
  String get deletePermanently => 'Delete Permanently';

  @override
  String deletePermanentlyConfirm(String title) {
    return 'Are you sure you want to permanently delete \"$title\"?\n\nThis action cannot be undone.';
  }

  @override
  String get deletePermanentlyConfirmUntitled =>
      'Are you sure you want to permanently delete this note?\n\nThis action cannot be undone.';

  @override
  String get justNow => 'Just now';

  @override
  String minutesAgo(int minutes) {
    return '${minutes}m ago';
  }

  @override
  String hoursAgo(int hours) {
    return '${hours}h ago';
  }

  @override
  String daysAgo(int days) {
    return '$days days ago';
  }

  @override
  String get deletedJustNow => 'Deleted just now';

  @override
  String deletedMinutesAgo(int minutes) {
    return 'Deleted $minutes minutes ago';
  }

  @override
  String deletedHoursAgo(int hours) {
    return 'Deleted $hours hours ago';
  }

  @override
  String deletedDaysAgo(int days) {
    return 'Deleted $days days ago';
  }

  @override
  String deletedOnDate(String date) {
    return 'Deleted on $date';
  }

  @override
  String get unknownDate => 'Unknown date';

  @override
  String get errorOccurred => 'An error occurred';

  @override
  String get tryAgain => 'Try Again';

  @override
  String get listView => 'List View';

  @override
  String get gridView => 'Grid View';

  @override
  String get graphView => 'Graph View';

  @override
  String get familyTreeView => 'Family Tree View';

  @override
  String get addNoteToUseFamilyTree => 'Add notes to use family tree view';

  @override
  String get newest => 'Newest';

  @override
  String get oldest => 'Oldest';

  @override
  String get reset => 'Reset';

  @override
  String get addNoteToUseGraph => 'Add notes to use graph view';

  @override
  String get emptyNote => 'Empty note';

  @override
  String get newFolder => 'New Folder';

  @override
  String get editFolder => 'Edit Folder';

  @override
  String get folderName => 'Folder Name';

  @override
  String get enterFolderName => 'Enter folder name';

  @override
  String get pleaseEnterFolderName => 'Please enter folder name';

  @override
  String get selectColor => 'Select Color';

  @override
  String get deleteFolder => 'Delete Folder';

  @override
  String deleteFolderConfirm(String name) {
    return 'Are you sure you want to delete \"$name\"?\n\nNotes in the folder will not be deleted, only the folder will be removed.';
  }

  @override
  String get deleteFolderConfirmUntitled =>
      'Are you sure you want to delete this folder?\n\nNotes in the folder will not be deleted, only the folder will be removed.';

  @override
  String noteCount(int count) {
    return '$count notes';
  }

  @override
  String get noNotesInFolder => 'No notes in this folder';

  @override
  String get longPressToAdd =>
      'Long press on a note card to add notes to this folder';

  @override
  String get noFoldersYetCreateInSettings => 'No folders yet';

  @override
  String get createFolderInSettings =>
      'You can create folders from the settings tab';

  @override
  String imageError(String error) {
    return 'Error adding image: $error';
  }

  @override
  String get backup => 'Backup';

  @override
  String get backupAndRestore => 'Backup & Restore';

  @override
  String get backupAndRestoreDescription => 'Backup or restore your data';

  @override
  String get backupTitle => 'Backup & Restore';

  @override
  String get backupDescription =>
      'Backup all your notes, folders, and settings to a ZIP file or restore from a previous backup.';

  @override
  String get createBackup => 'Create Backup';

  @override
  String get createBackupDescription => 'Export all data as a ZIP file';

  @override
  String get restoreBackup => 'Restore Backup';

  @override
  String get restoreBackupDescription => 'Import data from a backup file';

  @override
  String get backupNote =>
      'Your backup includes all notes, folders, and app settings. Store it in a safe place.';

  @override
  String get backupFileSubject => 'Not Defteri Backup';

  @override
  String get backupCreatedSuccess => 'Backup created successfully!';

  @override
  String backupCreatedError(String error) {
    return 'Backup error: $error';
  }

  @override
  String get fileNotSelected => 'No file selected';

  @override
  String restoreSuccess(int notes, int folders) {
    return '$notes notes and $folders folders restored';
  }

  @override
  String restoreError(String error) {
    return 'Restore error: $error';
  }

  @override
  String get restoreComplete => 'Restore Complete';

  @override
  String get restartAppMessage =>
      'Please restart the app to see all restored settings.';

  @override
  String get tapToSelectEmoji => 'Tap to select icon';

  @override
  String get removeEmoji => 'Remove Emoji';

  @override
  String get searchEmoji => 'Search emoji...';

  @override
  String get onboardingWelcomeTitle => 'Welcome to Not Defteri';

  @override
  String get onboardingWelcomeBody =>
      'The smartest way to keep your notes organized. A powerful and simple note-taking experience awaits you.';

  @override
  String get onboardingOrganizeTitle => 'Organize & Categorize';

  @override
  String get onboardingOrganizeBody =>
      'Organize your notes into folders. Personalize your folders with emoji icons.';

  @override
  String get onboardingRichTextTitle => 'Rich Text Support';

  @override
  String get onboardingRichTextBody =>
      'Bold, italic, and more. Create professional-looking notes. Add photos and enrich your notes.';

  @override
  String get onboardingSecureTitle => 'Secure & Local';

  @override
  String get onboardingSecureBody =>
      'All your data is securely stored on your device. Protect your data with backup and restore features.';

  @override
  String get getStarted => 'Get Started';

  @override
  String get next => 'Next';

  @override
  String get skip => 'Skip';

  @override
  String get archivedNotes => 'Archived Notes';

  @override
  String get noArchivedNotes => 'No archived notes';

  @override
  String get noArchivedNotesDescription => 'Notes you archive will appear here';

  @override
  String get archive => 'Archive';

  @override
  String get unarchive => 'Unarchive';

  @override
  String get noteArchived => 'Note archived';

  @override
  String get noteUnarchived => 'Note unarchived';

  @override
  String get security => 'Security';

  @override
  String get securityDescription => 'App lock settings';

  @override
  String get securityInfo => 'App Security';

  @override
  String get securityInfoDescription =>
      'Protect your app with a PIN code. You will need to enter the PIN code every time you open the app.';

  @override
  String get pinSettings => 'PIN Settings';

  @override
  String get pinLock => 'PIN Lock';

  @override
  String get pinLockDescription => 'Require PIN to open app';

  @override
  String get createPin => 'Create PIN';

  @override
  String get createPinDescription => 'Create a new 4-digit PIN';

  @override
  String get changePin => 'Change PIN';

  @override
  String get changePinDescription => 'Change your current PIN';

  @override
  String get removePin => 'Remove PIN';

  @override
  String get removePinDescription => 'Remove PIN protection';

  @override
  String get enterPin => 'Enter Your PIN';

  @override
  String get enterPinDescription => 'Enter your 4-digit PIN to access the app';

  @override
  String get enterNewPin => 'Enter your new 4-digit PIN';

  @override
  String get enterCurrentPin => 'Enter your current PIN';

  @override
  String get confirmPin => 'Confirm PIN';

  @override
  String get reenterPin => 'Re-enter your PIN';

  @override
  String get newPin => 'New PIN';

  @override
  String get wrongPin => 'Wrong PIN';

  @override
  String get pinCreated => 'PIN created successfully';

  @override
  String get pinChanged => 'PIN changed successfully';

  @override
  String get pinRemoved => 'PIN removed';

  @override
  String get pinMismatch => 'PINs do not match';

  @override
  String get deleteFolderToTrash => 'Move folder to trash';

  @override
  String deleteFolderToTrashConfirm(String name) {
    return 'Are you sure you want to move \"$name\" to trash?\n\nNotes in the folder will remain without a folder.';
  }

  @override
  String get deleteFolderToTrashConfirmUntitled =>
      'Are you sure you want to move this folder to trash?\n\nNotes in the folder will remain without a folder.';

  @override
  String get folderRestored => 'Folder restored';

  @override
  String get deleteFolderPermanently => 'Delete Folder Permanently';

  @override
  String deleteFolderPermanentlyConfirm(String name) {
    return 'Are you sure you want to permanently delete \"$name\"?\n\nThis action cannot be undone.';
  }

  @override
  String get deleteFolderPermanentlyConfirmUntitled =>
      'Are you sure you want to permanently delete this folder?\n\nThis action cannot be undone.';

  @override
  String get viewDeletedItems => 'View deleted items';

  @override
  String get notesTab => 'Notes';

  @override
  String get foldersTab => 'Folders';

  @override
  String get noDeletedFolders => 'No deleted folders';

  @override
  String get deletedFoldersAppear => 'Deleted folders will appear here';

  @override
  String get emptyTrashFolders =>
      'Are you sure you want to permanently delete all folders in the trash?\n\nThis action cannot be undone.';

  @override
  String get privacyPolicy => 'Privacy Policy';

  @override
  String get termsOfService => 'Terms of Service';

  @override
  String get reminder => 'Reminder';

  @override
  String get addReminder => 'Add Reminder';

  @override
  String get removeReminder => 'Remove Reminder';

  @override
  String get reminderSet => 'Reminder set';

  @override
  String get reminderRemoved => 'Reminder removed';

  @override
  String get selectDateTime => 'Select Date & Time';

  @override
  String get reminderNotification => 'Note Reminder';

  @override
  String reminderNotificationBody(String title) {
    return 'Reminder: $title';
  }

  @override
  String get today => 'Today';

  @override
  String get tomorrow => 'Tomorrow';

  @override
  String get pickDateTime => 'Pick date and time';

  @override
  String get reminderPastError => 'Cannot select a time in the past';

  @override
  String get at => 'at';

  @override
  String get archiveNote => 'Archive Note';

  @override
  String archiveNoteConfirm(String title) {
    return 'Are you sure you want to archive \"$title\"?\n\nYou can find it in the archived notes section.';
  }

  @override
  String get archiveNoteConfirmUntitled =>
      'Are you sure you want to archive this note?\n\nYou can find it in the archived notes section.';
}
