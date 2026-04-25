import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('tr'),
  ];

  /// The title of the application
  ///
  /// In en, this message translates to:
  /// **'Not Defteri'**
  String get appTitle;

  /// Notes tab title
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get notes;

  /// Folders tab title
  ///
  /// In en, this message translates to:
  /// **'Folders'**
  String get folders;

  /// Graph tab title
  ///
  /// In en, this message translates to:
  /// **'Graph'**
  String get graph;

  /// Settings tab title
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// Notes list page title
  ///
  /// In en, this message translates to:
  /// **'My Notes'**
  String get myNotes;

  /// Search notes placeholder
  ///
  /// In en, this message translates to:
  /// **'Search notes...'**
  String get searchNotes;

  /// Search folders placeholder
  ///
  /// In en, this message translates to:
  /// **'Search folders...'**
  String get searchFolders;

  /// Search in note placeholder
  ///
  /// In en, this message translates to:
  /// **'Search in note...'**
  String get searchInNote;

  /// No search results message
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get noResults;

  /// No search results message with query
  ///
  /// In en, this message translates to:
  /// **'No results found for \"{query}\"'**
  String noResultsFor(String query);

  /// Empty notes list message
  ///
  /// In en, this message translates to:
  /// **'No notes yet'**
  String get noNotesYet;

  /// Empty notes list hint
  ///
  /// In en, this message translates to:
  /// **'Tap + button to create your first note'**
  String get tapToCreate;

  /// Empty folders list message
  ///
  /// In en, this message translates to:
  /// **'No folders yet'**
  String get noFoldersYet;

  /// Empty folders list hint
  ///
  /// In en, this message translates to:
  /// **'Tap + button to create your first folder'**
  String get tapToCreateFolder;

  /// Default note title
  ///
  /// In en, this message translates to:
  /// **'Untitled note'**
  String get untitledNote;

  /// Default folder name
  ///
  /// In en, this message translates to:
  /// **'Untitled folder'**
  String get untitledFolder;

  /// Title field label
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get title;

  /// Done button text
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get done;

  /// Cancel button text
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Save button text
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// Delete button text
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// Edit button text
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// Add photo tooltip
  ///
  /// In en, this message translates to:
  /// **'Add Photo'**
  String get addPhoto;

  /// Search in note tooltip
  ///
  /// In en, this message translates to:
  /// **'Search in Note'**
  String get searchInNoteTooltip;

  /// Close search tooltip
  ///
  /// In en, this message translates to:
  /// **'Close Search'**
  String get closeSearch;

  /// Pin note action
  ///
  /// In en, this message translates to:
  /// **'Pin'**
  String get pin;

  /// Unpin note action
  ///
  /// In en, this message translates to:
  /// **'Unpin'**
  String get unpin;

  /// Move to folder action
  ///
  /// In en, this message translates to:
  /// **'Move to Folder'**
  String get moveToFolder;

  /// Remove from folder action
  ///
  /// In en, this message translates to:
  /// **'Remove from Folder'**
  String get removeFromFolder;

  /// Select folder dialog title
  ///
  /// In en, this message translates to:
  /// **'Select Folder'**
  String get selectFolder;

  /// In folder badge
  ///
  /// In en, this message translates to:
  /// **'In folder'**
  String get inFolder;

  /// Delete note dialog title
  ///
  /// In en, this message translates to:
  /// **'Delete Note'**
  String get deleteNote;

  /// Delete note confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete \"{title}\"?\n\nThe note will be moved to trash.'**
  String deleteNoteConfirm(String title);

  /// Delete untitled note confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this note?\n\nThe note will be moved to trash.'**
  String get deleteNoteConfirmUntitled;

  /// Appearance settings section
  ///
  /// In en, this message translates to:
  /// **'Appearance'**
  String get appearance;

  /// Dark theme setting title
  ///
  /// In en, this message translates to:
  /// **'Dark Theme'**
  String get darkTheme;

  /// Dark theme setting subtitle
  ///
  /// In en, this message translates to:
  /// **'Use dark theme'**
  String get useDarkTheme;

  /// Language setting title
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// Language setting subtitle
  ///
  /// In en, this message translates to:
  /// **'Change app language'**
  String get changeLanguage;

  /// Language selection page title
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// English language name
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// Turkish language name
  ///
  /// In en, this message translates to:
  /// **'Turkish'**
  String get turkish;

  /// Data management settings section
  ///
  /// In en, this message translates to:
  /// **'Data Management'**
  String get dataManagement;

  /// Trash setting title
  ///
  /// In en, this message translates to:
  /// **'Trash'**
  String get trash;

  /// Trash setting subtitle
  ///
  /// In en, this message translates to:
  /// **'View deleted notes'**
  String get viewDeletedNotes;

  /// Other settings section
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get other;

  /// About setting title
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// About setting subtitle
  ///
  /// In en, this message translates to:
  /// **'App information'**
  String get appInfo;

  /// Version text
  ///
  /// In en, this message translates to:
  /// **'Version {version}'**
  String version(String version);

  /// Version text with build number
  ///
  /// In en, this message translates to:
  /// **'Version {version} ({buildNumber})'**
  String versionWithBuild(String version, String buildNumber);

  /// Loading version text
  ///
  /// In en, this message translates to:
  /// **'Loading version...'**
  String get loadingVersion;

  /// App description in about page
  ///
  /// In en, this message translates to:
  /// **'Rich text notes application'**
  String get richTextNotesApp;

  /// Empty trash message
  ///
  /// In en, this message translates to:
  /// **'Trash is empty'**
  String get trashEmpty;

  /// Empty trash hint
  ///
  /// In en, this message translates to:
  /// **'Deleted notes will appear here'**
  String get deletedNotesAppear;

  /// Empty trash button
  ///
  /// In en, this message translates to:
  /// **'Empty Trash'**
  String get emptyTrash;

  /// Empty trash confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to permanently delete all notes in the trash?\n\nThis action cannot be undone.'**
  String get emptyTrashConfirm;

  /// Restore note action
  ///
  /// In en, this message translates to:
  /// **'Restore'**
  String get restore;

  /// Note restored snackbar message
  ///
  /// In en, this message translates to:
  /// **'Note restored'**
  String get noteRestored;

  /// Delete permanently action
  ///
  /// In en, this message translates to:
  /// **'Delete Permanently'**
  String get deletePermanently;

  /// Delete permanently confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to permanently delete \"{title}\"?\n\nThis action cannot be undone.'**
  String deletePermanentlyConfirm(String title);

  /// Delete permanently untitled note confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to permanently delete this note?\n\nThis action cannot be undone.'**
  String get deletePermanentlyConfirmUntitled;

  /// Just now time
  ///
  /// In en, this message translates to:
  /// **'Just now'**
  String get justNow;

  /// Minutes ago time
  ///
  /// In en, this message translates to:
  /// **'{minutes}m ago'**
  String minutesAgo(int minutes);

  /// Hours ago time
  ///
  /// In en, this message translates to:
  /// **'{hours}h ago'**
  String hoursAgo(int hours);

  /// Days ago time
  ///
  /// In en, this message translates to:
  /// **'{days} days ago'**
  String daysAgo(int days);

  /// Deleted just now time
  ///
  /// In en, this message translates to:
  /// **'Deleted just now'**
  String get deletedJustNow;

  /// Deleted minutes ago time
  ///
  /// In en, this message translates to:
  /// **'Deleted {minutes} minutes ago'**
  String deletedMinutesAgo(int minutes);

  /// Deleted hours ago time
  ///
  /// In en, this message translates to:
  /// **'Deleted {hours} hours ago'**
  String deletedHoursAgo(int hours);

  /// Deleted days ago time
  ///
  /// In en, this message translates to:
  /// **'Deleted {days} days ago'**
  String deletedDaysAgo(int days);

  /// Deleted on date
  ///
  /// In en, this message translates to:
  /// **'Deleted on {date}'**
  String deletedOnDate(String date);

  /// Unknown date text
  ///
  /// In en, this message translates to:
  /// **'Unknown date'**
  String get unknownDate;

  /// Error occurred message
  ///
  /// In en, this message translates to:
  /// **'An error occurred'**
  String get errorOccurred;

  /// Try again button
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get tryAgain;

  /// List view tooltip
  ///
  /// In en, this message translates to:
  /// **'List View'**
  String get listView;

  /// Grid view tooltip
  ///
  /// In en, this message translates to:
  /// **'Grid View'**
  String get gridView;

  /// Graph view page title
  ///
  /// In en, this message translates to:
  /// **'Graph View'**
  String get graphView;

  /// Family tree view page title
  ///
  /// In en, this message translates to:
  /// **'Family Tree View'**
  String get familyTreeView;

  /// Empty family tree view hint
  ///
  /// In en, this message translates to:
  /// **'Add notes to use family tree view'**
  String get addNoteToUseFamilyTree;

  /// Newest note label
  ///
  /// In en, this message translates to:
  /// **'Newest'**
  String get newest;

  /// Oldest note label
  ///
  /// In en, this message translates to:
  /// **'Oldest'**
  String get oldest;

  /// Reset button tooltip
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get reset;

  /// Empty graph view hint
  ///
  /// In en, this message translates to:
  /// **'Add notes to use graph view'**
  String get addNoteToUseGraph;

  /// Empty note label in graph
  ///
  /// In en, this message translates to:
  /// **'Empty note'**
  String get emptyNote;

  /// New folder page title
  ///
  /// In en, this message translates to:
  /// **'New Folder'**
  String get newFolder;

  /// Edit folder page title
  ///
  /// In en, this message translates to:
  /// **'Edit Folder'**
  String get editFolder;

  /// Folder name field label
  ///
  /// In en, this message translates to:
  /// **'Folder Name'**
  String get folderName;

  /// Folder name field hint
  ///
  /// In en, this message translates to:
  /// **'Enter folder name'**
  String get enterFolderName;

  /// Folder name validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter folder name'**
  String get pleaseEnterFolderName;

  /// Color selection label
  ///
  /// In en, this message translates to:
  /// **'Select Color'**
  String get selectColor;

  /// Delete folder dialog title
  ///
  /// In en, this message translates to:
  /// **'Delete Folder'**
  String get deleteFolder;

  /// Delete folder confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete \"{name}\"?\n\nNotes in the folder will not be deleted, only the folder will be removed.'**
  String deleteFolderConfirm(String name);

  /// Delete untitled folder confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this folder?\n\nNotes in the folder will not be deleted, only the folder will be removed.'**
  String get deleteFolderConfirmUntitled;

  /// Note count in folder
  ///
  /// In en, this message translates to:
  /// **'{count} notes'**
  String noteCount(int count);

  /// Empty folder notes message
  ///
  /// In en, this message translates to:
  /// **'No notes in this folder'**
  String get noNotesInFolder;

  /// Empty folder notes hint
  ///
  /// In en, this message translates to:
  /// **'Long press on a note card to add notes to this folder'**
  String get longPressToAdd;

  /// No folders message in folder selection
  ///
  /// In en, this message translates to:
  /// **'No folders yet'**
  String get noFoldersYetCreateInSettings;

  /// Create folder hint in folder selection
  ///
  /// In en, this message translates to:
  /// **'You can create folders from the settings tab'**
  String get createFolderInSettings;

  /// Image error message
  ///
  /// In en, this message translates to:
  /// **'Error adding image: {error}'**
  String imageError(String error);

  /// Backup page title
  ///
  /// In en, this message translates to:
  /// **'Backup'**
  String get backup;

  /// Backup setting title
  ///
  /// In en, this message translates to:
  /// **'Backup & Restore'**
  String get backupAndRestore;

  /// Backup setting subtitle
  ///
  /// In en, this message translates to:
  /// **'Backup or restore your data'**
  String get backupAndRestoreDescription;

  /// Backup page main title
  ///
  /// In en, this message translates to:
  /// **'Backup & Restore'**
  String get backupTitle;

  /// Backup page description
  ///
  /// In en, this message translates to:
  /// **'Backup all your notes, folders, and settings to a ZIP file or restore from a previous backup.'**
  String get backupDescription;

  /// Create backup button
  ///
  /// In en, this message translates to:
  /// **'Create Backup'**
  String get createBackup;

  /// Create backup description
  ///
  /// In en, this message translates to:
  /// **'Export all data as a ZIP file'**
  String get createBackupDescription;

  /// Restore backup button
  ///
  /// In en, this message translates to:
  /// **'Restore Backup'**
  String get restoreBackup;

  /// Restore backup description
  ///
  /// In en, this message translates to:
  /// **'Import data from a backup file'**
  String get restoreBackupDescription;

  /// Backup page note
  ///
  /// In en, this message translates to:
  /// **'Your backup includes all notes, folders, and app settings. Store it in a safe place.'**
  String get backupNote;

  /// Backup file share subject
  ///
  /// In en, this message translates to:
  /// **'Not Defteri Backup'**
  String get backupFileSubject;

  /// Backup success message
  ///
  /// In en, this message translates to:
  /// **'Backup created successfully!'**
  String get backupCreatedSuccess;

  /// Backup error message
  ///
  /// In en, this message translates to:
  /// **'Backup error: {error}'**
  String backupCreatedError(String error);

  /// File not selected message
  ///
  /// In en, this message translates to:
  /// **'No file selected'**
  String get fileNotSelected;

  /// Restore success message
  ///
  /// In en, this message translates to:
  /// **'{notes} notes and {folders} folders restored'**
  String restoreSuccess(int notes, int folders);

  /// Restore error message
  ///
  /// In en, this message translates to:
  /// **'Restore error: {error}'**
  String restoreError(String error);

  /// Restore complete dialog title
  ///
  /// In en, this message translates to:
  /// **'Restore Complete'**
  String get restoreComplete;

  /// Restart app message
  ///
  /// In en, this message translates to:
  /// **'Please restart the app to see all restored settings.'**
  String get restartAppMessage;

  /// Hint text for emoji selection
  ///
  /// In en, this message translates to:
  /// **'Tap to select icon'**
  String get tapToSelectEmoji;

  /// Remove emoji button text
  ///
  /// In en, this message translates to:
  /// **'Remove Emoji'**
  String get removeEmoji;

  /// Emoji search placeholder
  ///
  /// In en, this message translates to:
  /// **'Search emoji...'**
  String get searchEmoji;

  /// Onboarding welcome screen title
  ///
  /// In en, this message translates to:
  /// **'Welcome to Not Defteri'**
  String get onboardingWelcomeTitle;

  /// Onboarding welcome screen body
  ///
  /// In en, this message translates to:
  /// **'The smartest way to keep your notes organized. A powerful and simple note-taking experience awaits you.'**
  String get onboardingWelcomeBody;

  /// Onboarding organize screen title
  ///
  /// In en, this message translates to:
  /// **'Organize & Categorize'**
  String get onboardingOrganizeTitle;

  /// Onboarding organize screen body
  ///
  /// In en, this message translates to:
  /// **'Organize your notes into folders. Personalize your folders with emoji icons.'**
  String get onboardingOrganizeBody;

  /// Onboarding rich text screen title
  ///
  /// In en, this message translates to:
  /// **'Rich Text Support'**
  String get onboardingRichTextTitle;

  /// Onboarding rich text screen body
  ///
  /// In en, this message translates to:
  /// **'Bold, italic, and more. Create professional-looking notes. Add photos and enrich your notes.'**
  String get onboardingRichTextBody;

  /// Onboarding secure screen title
  ///
  /// In en, this message translates to:
  /// **'Secure & Local'**
  String get onboardingSecureTitle;

  /// Onboarding secure screen body
  ///
  /// In en, this message translates to:
  /// **'All your data is securely stored on your device. Protect your data with backup and restore features.'**
  String get onboardingSecureBody;

  /// Get started button text
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get getStarted;

  /// Next button text
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// Skip button text
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get skip;

  /// Archived notes page title
  ///
  /// In en, this message translates to:
  /// **'Archived Notes'**
  String get archivedNotes;

  /// Empty archived notes message
  ///
  /// In en, this message translates to:
  /// **'No archived notes'**
  String get noArchivedNotes;

  /// Empty archived notes hint
  ///
  /// In en, this message translates to:
  /// **'Notes you archive will appear here'**
  String get noArchivedNotesDescription;

  /// Archive action
  ///
  /// In en, this message translates to:
  /// **'Archive'**
  String get archive;

  /// Unarchive action
  ///
  /// In en, this message translates to:
  /// **'Unarchive'**
  String get unarchive;

  /// Note archived snackbar message
  ///
  /// In en, this message translates to:
  /// **'Note archived'**
  String get noteArchived;

  /// Note unarchived snackbar message
  ///
  /// In en, this message translates to:
  /// **'Note unarchived'**
  String get noteUnarchived;

  /// Security settings title
  ///
  /// In en, this message translates to:
  /// **'Security'**
  String get security;

  /// Security settings subtitle
  ///
  /// In en, this message translates to:
  /// **'App lock settings'**
  String get securityDescription;

  /// Security info card title
  ///
  /// In en, this message translates to:
  /// **'App Security'**
  String get securityInfo;

  /// Security info card description
  ///
  /// In en, this message translates to:
  /// **'Protect your app with a PIN code. You will need to enter the PIN code every time you open the app.'**
  String get securityInfoDescription;

  /// PIN settings section title
  ///
  /// In en, this message translates to:
  /// **'PIN Settings'**
  String get pinSettings;

  /// PIN lock toggle title
  ///
  /// In en, this message translates to:
  /// **'PIN Lock'**
  String get pinLock;

  /// PIN lock toggle subtitle
  ///
  /// In en, this message translates to:
  /// **'Require PIN to open app'**
  String get pinLockDescription;

  /// Create PIN button title
  ///
  /// In en, this message translates to:
  /// **'Create PIN'**
  String get createPin;

  /// Create PIN button subtitle
  ///
  /// In en, this message translates to:
  /// **'Create a new 4-digit PIN'**
  String get createPinDescription;

  /// Change PIN button title
  ///
  /// In en, this message translates to:
  /// **'Change PIN'**
  String get changePin;

  /// Change PIN button subtitle
  ///
  /// In en, this message translates to:
  /// **'Change your current PIN'**
  String get changePinDescription;

  /// Remove PIN button title
  ///
  /// In en, this message translates to:
  /// **'Remove PIN'**
  String get removePin;

  /// Remove PIN button subtitle
  ///
  /// In en, this message translates to:
  /// **'Remove PIN protection'**
  String get removePinDescription;

  /// Lock screen title
  ///
  /// In en, this message translates to:
  /// **'Enter Your PIN'**
  String get enterPin;

  /// Lock screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Enter your 4-digit PIN to access the app'**
  String get enterPinDescription;

  /// New PIN input hint
  ///
  /// In en, this message translates to:
  /// **'Enter your new 4-digit PIN'**
  String get enterNewPin;

  /// Current PIN input hint
  ///
  /// In en, this message translates to:
  /// **'Enter your current PIN'**
  String get enterCurrentPin;

  /// Confirm PIN dialog title
  ///
  /// In en, this message translates to:
  /// **'Confirm PIN'**
  String get confirmPin;

  /// Confirm PIN dialog subtitle
  ///
  /// In en, this message translates to:
  /// **'Re-enter your PIN'**
  String get reenterPin;

  /// New PIN dialog title
  ///
  /// In en, this message translates to:
  /// **'New PIN'**
  String get newPin;

  /// Wrong PIN error message
  ///
  /// In en, this message translates to:
  /// **'Wrong PIN'**
  String get wrongPin;

  /// PIN created success message
  ///
  /// In en, this message translates to:
  /// **'PIN created successfully'**
  String get pinCreated;

  /// PIN changed success message
  ///
  /// In en, this message translates to:
  /// **'PIN changed successfully'**
  String get pinChanged;

  /// PIN removed success message
  ///
  /// In en, this message translates to:
  /// **'PIN removed'**
  String get pinRemoved;

  /// PIN mismatch error message
  ///
  /// In en, this message translates to:
  /// **'PINs do not match'**
  String get pinMismatch;

  /// Move folder to trash action
  ///
  /// In en, this message translates to:
  /// **'Move folder to trash'**
  String get deleteFolderToTrash;

  /// Move folder to trash confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to move \"{name}\" to trash?\n\nNotes in the folder will remain without a folder.'**
  String deleteFolderToTrashConfirm(String name);

  /// Move untitled folder to trash confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to move this folder to trash?\n\nNotes in the folder will remain without a folder.'**
  String get deleteFolderToTrashConfirmUntitled;

  /// Folder restored snackbar message
  ///
  /// In en, this message translates to:
  /// **'Folder restored'**
  String get folderRestored;

  /// Delete folder permanently action
  ///
  /// In en, this message translates to:
  /// **'Delete Folder Permanently'**
  String get deleteFolderPermanently;

  /// Delete folder permanently confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to permanently delete \"{name}\"?\n\nThis action cannot be undone.'**
  String deleteFolderPermanentlyConfirm(String name);

  /// Delete untitled folder permanently confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to permanently delete this folder?\n\nThis action cannot be undone.'**
  String get deleteFolderPermanentlyConfirmUntitled;

  /// Trash setting subtitle with folders
  ///
  /// In en, this message translates to:
  /// **'View deleted items'**
  String get viewDeletedItems;

  /// Notes tab in trash page
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get notesTab;

  /// Folders tab in trash page
  ///
  /// In en, this message translates to:
  /// **'Folders'**
  String get foldersTab;

  /// Empty deleted folders message
  ///
  /// In en, this message translates to:
  /// **'No deleted folders'**
  String get noDeletedFolders;

  /// Empty deleted folders hint
  ///
  /// In en, this message translates to:
  /// **'Deleted folders will appear here'**
  String get deletedFoldersAppear;

  /// Empty trash folders confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to permanently delete all folders in the trash?\n\nThis action cannot be undone.'**
  String get emptyTrashFolders;

  /// Privacy policy link text
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicy;

  /// Terms of service link text
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get termsOfService;

  /// Reminder label
  ///
  /// In en, this message translates to:
  /// **'Reminder'**
  String get reminder;

  /// Add reminder action
  ///
  /// In en, this message translates to:
  /// **'Add Reminder'**
  String get addReminder;

  /// Remove reminder action
  ///
  /// In en, this message translates to:
  /// **'Remove Reminder'**
  String get removeReminder;

  /// Reminder set snackbar message
  ///
  /// In en, this message translates to:
  /// **'Reminder set'**
  String get reminderSet;

  /// Reminder removed snackbar message
  ///
  /// In en, this message translates to:
  /// **'Reminder removed'**
  String get reminderRemoved;

  /// Select date and time dialog title
  ///
  /// In en, this message translates to:
  /// **'Select Date & Time'**
  String get selectDateTime;

  /// Notification title for reminder
  ///
  /// In en, this message translates to:
  /// **'Note Reminder'**
  String get reminderNotification;

  /// Notification body for reminder
  ///
  /// In en, this message translates to:
  /// **'Reminder: {title}'**
  String reminderNotificationBody(String title);

  /// Today label
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// Tomorrow label
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get tomorrow;

  /// Pick date and time hint
  ///
  /// In en, this message translates to:
  /// **'Pick date and time'**
  String get pickDateTime;

  /// Error message for past time selection
  ///
  /// In en, this message translates to:
  /// **'Cannot select a time in the past'**
  String get reminderPastError;

  /// Time separator word
  ///
  /// In en, this message translates to:
  /// **'at'**
  String get at;

  /// Archive note dialog title
  ///
  /// In en, this message translates to:
  /// **'Archive Note'**
  String get archiveNote;

  /// Archive note confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to archive \"{title}\"?\n\nYou can find it in the archived notes section.'**
  String archiveNoteConfirm(String title);

  /// Archive untitled note confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to archive this note?\n\nYou can find it in the archived notes section.'**
  String get archiveNoteConfirmUntitled;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'tr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'tr':
      return AppLocalizationsTr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
