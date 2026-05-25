export type Lang = 'fr' | 'en' | 'es' | 'it' | 'de'

export interface Translations {
  nav_dashboard: string; nav_queue: string; nav_history: string; nav_servers: string
  nav_categories: string; nav_schedule: string; nav_rss: string; nav_settings: string; nav_preferences: string
  dash_title: string; dash_speed: string; dash_stats: string; dash_storage: string
  dash_remaining: string; dash_time_left: string; dash_free_space: string; dash_jobs: string
  dash_global_progress: string; dash_queue: string; dash_see_all: string; dash_more_jobs: string
  dash_limit: string; dash_cache: string; dash_download_folder: string; dash_complete_folder: string
  dash_add_nzb: string; dash_resume: string; dash_pause: string
  queue_title: string; queue_empty: string; queue_pause_all: string; queue_resume_all: string
  queue_clear: string; queue_add: string; queue_files: string; queue_rename: string
  queue_delete: string; queue_move_up: string; queue_move_down: string
  queue_status_downloading: string; queue_status_paused: string; queue_status_queued: string
  queue_remaining: string; queue_eta: string; queue_speed_limit: string
  hist_title: string; hist_entries: string; hist_search: string; hist_no_result: string
  hist_delete: string; hist_retry: string; hist_completed: string; hist_failed: string
  srv_title: string; srv_add: string; srv_edit: string; srv_delete: string; srv_test: string
  srv_name: string; srv_host: string; srv_port: string; srv_user: string; srv_pass: string
  srv_connections: string; srv_ssl: string; srv_active: string; srv_optional: string
  srv_retention: string; srv_timeout: string; srv_priority: string; srv_save: string
  srv_test_ok: string; srv_test_fail: string; srv_no_servers: string; srv_active_conn: string
  cat_title: string; cat_add: string; cat_edit: string; cat_delete: string; cat_save: string
  cat_name: string; cat_folder: string; cat_script: string; cat_priority: string; cat_pp: string; cat_none: string
  set_title: string; set_general: string; set_folders: string; set_switches: string
  set_postproc: string; set_notif: string; set_security: string; set_quota: string; set_advanced: string
  set_restart: string; set_shutdown: string; set_saved: string
  pref_title: string; pref_appearance: string; pref_theme: string; pref_accent: string
  pref_language: string; pref_branding: string; pref_app_name: string; pref_logo_url: string
  pref_interface: string; pref_refresh: string; pref_dash_jobs: string; pref_compact: string
  pref_speed_unit: string; pref_notifications: string; pref_notif_complete: string; pref_notif_fail: string
  pref_dark: string; pref_light: string; pref_save: string; pref_reset: string
  pref_accent_cyan: string; pref_accent_violet: string; pref_accent_green: string
  pref_accent_orange: string; pref_accent_rose: string
  common_cancel: string; common_confirm: string; common_yes: string; common_no: string
  common_loading: string; common_error: string; common_saved: string; common_delete_confirm: string
  common_default: string; common_none: string; common_apply: string
}

const fr: Translations = {
  nav_dashboard: 'Dashboard', nav_queue: 'Queue', nav_history: 'Historique',
  nav_servers: 'Serveurs', nav_categories: 'Categories', nav_schedule: 'Planning',
  nav_rss: 'RSS', nav_settings: 'Parametres', nav_preferences: 'Preferences',
  dash_title: 'Dashboard', dash_speed: 'Vitesse actuelle', dash_stats: 'Statistiques',
  dash_storage: 'Stockage', dash_remaining: 'Restant', dash_time_left: 'Temps restant',
  dash_free_space: 'Espace libre', dash_jobs: 'Jobs en queue', dash_global_progress: 'Progression globale',
  dash_queue: "File d'attente", dash_see_all: 'Tout voir', dash_more_jobs: 'job(s) de plus',
  dash_limit: 'Limite', dash_cache: 'Cache', dash_download_folder: 'Telechargement',
  dash_complete_folder: 'Completion', dash_add_nzb: 'Ajouter NZB', dash_resume: 'Reprendre', dash_pause: 'Pause',
  queue_title: 'Queue', queue_empty: 'Queue vide', queue_pause_all: 'Pause tout',
  queue_resume_all: 'Reprendre tout', queue_clear: 'Vider queue', queue_add: 'Ajouter NZB',
  queue_files: 'Fichiers', queue_rename: 'Renommer', queue_delete: 'Supprimer',
  queue_move_up: 'Monter', queue_move_down: 'Descendre',
  queue_status_downloading: 'Telechargement', queue_status_paused: 'En pause', queue_status_queued: 'En attente',
  queue_remaining: 'restants', queue_eta: 'ETA', queue_speed_limit: 'Limite vitesse',
  hist_title: 'Historique', hist_entries: 'entrees', hist_search: 'Rechercher...',
  hist_no_result: 'Aucun resultat', hist_delete: 'Supprimer', hist_retry: 'Relancer',
  hist_completed: 'Termine', hist_failed: 'Echec',
  srv_title: 'Serveurs', srv_add: 'Ajouter un serveur', srv_edit: 'Modifier serveur',
  srv_delete: 'Supprimer', srv_test: 'Tester', srv_name: 'Nom', srv_host: 'Hote',
  srv_port: 'Port', srv_user: 'Utilisateur', srv_pass: 'Mot de passe',
  srv_connections: 'Connexions', srv_ssl: 'SSL/TLS', srv_active: 'Actif',
  srv_optional: 'Optionnel (backup)', srv_retention: 'Retention (jours, 0=illimite)',
  srv_timeout: 'Timeout (s)', srv_priority: 'Priorite', srv_save: 'Sauvegarder',
  srv_test_ok: 'Connexion OK', srv_test_fail: 'Echec connexion', srv_no_servers: 'Aucun serveur configure',
  srv_active_conn: 'connexion(s) active(s)',
  cat_title: 'Categories', cat_add: 'Nouvelle categorie', cat_edit: 'Modifier categorie',
  cat_delete: 'Supprimer', cat_save: 'Sauvegarder', cat_name: 'Nom', cat_folder: 'Dossier',
  cat_script: 'Script', cat_priority: 'Priorite', cat_pp: 'Post-traitement', cat_none: 'Aucune',
  set_title: 'Parametres', set_general: 'General', set_folders: 'Dossiers',
  set_switches: 'Comportement', set_postproc: 'Post-traitement', set_notif: 'Notifications',
  set_security: 'Securite', set_quota: 'Quota', set_advanced: 'Avance',
  set_restart: 'Redemarrer', set_shutdown: 'Eteindre', set_saved: 'Sauvegarde',
  pref_title: 'Preferences', pref_appearance: 'Apparence', pref_theme: 'Theme',
  pref_accent: "Couleur d'accentuation", pref_language: 'Langue', pref_branding: 'Identite',
  pref_app_name: "Nom de l'application", pref_logo_url: 'URL du logo',
  pref_interface: 'Interface', pref_refresh: 'Rafraichissement (ms)',
  pref_dash_jobs: 'Jobs sur le dashboard', pref_compact: 'Mode compact',
  pref_speed_unit: 'Unite de vitesse', pref_notifications: 'Notifications navigateur',
  pref_notif_complete: 'Notifier quand un job termine', pref_notif_fail: "Notifier en cas d'echec",
  pref_dark: 'Sombre', pref_light: 'Clair', pref_save: 'Sauvegarder',
  pref_reset: 'Reinitialiser', pref_accent_cyan: 'Cyan', pref_accent_violet: 'Violet',
  pref_accent_green: 'Vert', pref_accent_orange: 'Orange', pref_accent_rose: 'Rose',
  common_cancel: 'Annuler', common_confirm: 'Confirmer', common_yes: 'Oui', common_no: 'Non',
  common_loading: 'Chargement...', common_error: 'Erreur', common_saved: 'Sauvegarde !',
  common_delete_confirm: 'Supprimer ?', common_default: 'Defaut', common_none: 'Aucun',
  common_apply: 'Appliquer',
}

const en: Translations = {
  nav_dashboard: 'Dashboard', nav_queue: 'Queue', nav_history: 'History',
  nav_servers: 'Servers', nav_categories: 'Categories', nav_schedule: 'Schedule',
  nav_rss: 'RSS', nav_settings: 'Settings', nav_preferences: 'Preferences',
  dash_title: 'Dashboard', dash_speed: 'Current Speed', dash_stats: 'Statistics',
  dash_storage: 'Storage', dash_remaining: 'Remaining', dash_time_left: 'Time Left',
  dash_free_space: 'Free Space', dash_jobs: 'Queued Jobs', dash_global_progress: 'Global Progress',
  dash_queue: 'Queue', dash_see_all: 'See all', dash_more_jobs: 'more job(s)',
  dash_limit: 'Limit', dash_cache: 'Cache', dash_download_folder: 'Download',
  dash_complete_folder: 'Complete', dash_add_nzb: 'Add NZB', dash_resume: 'Resume', dash_pause: 'Pause',
  queue_title: 'Queue', queue_empty: 'Queue is empty', queue_pause_all: 'Pause all',
  queue_resume_all: 'Resume all', queue_clear: 'Clear queue', queue_add: 'Add NZB',
  queue_files: 'Files', queue_rename: 'Rename', queue_delete: 'Delete',
  queue_move_up: 'Move up', queue_move_down: 'Move down',
  queue_status_downloading: 'Downloading', queue_status_paused: 'Paused', queue_status_queued: 'Queued',
  queue_remaining: 'remaining', queue_eta: 'ETA', queue_speed_limit: 'Speed limit',
  hist_title: 'History', hist_entries: 'entries', hist_search: 'Search...',
  hist_no_result: 'No results', hist_delete: 'Delete', hist_retry: 'Retry',
  hist_completed: 'Completed', hist_failed: 'Failed',
  srv_title: 'Servers', srv_add: 'Add server', srv_edit: 'Edit server',
  srv_delete: 'Delete', srv_test: 'Test', srv_name: 'Name', srv_host: 'Host',
  srv_port: 'Port', srv_user: 'Username', srv_pass: 'Password',
  srv_connections: 'Connections', srv_ssl: 'SSL/TLS', srv_active: 'Active',
  srv_optional: 'Optional (backup)', srv_retention: 'Retention (days, 0=unlimited)',
  srv_timeout: 'Timeout (s)', srv_priority: 'Priority', srv_save: 'Save',
  srv_test_ok: 'Connection OK', srv_test_fail: 'Connection failed', srv_no_servers: 'No servers configured',
  srv_active_conn: 'active connection(s)',
  cat_title: 'Categories', cat_add: 'New category', cat_edit: 'Edit category',
  cat_delete: 'Delete', cat_save: 'Save', cat_name: 'Name', cat_folder: 'Folder',
  cat_script: 'Script', cat_priority: 'Priority', cat_pp: 'Post-processing', cat_none: 'None',
  set_title: 'Settings', set_general: 'General', set_folders: 'Folders',
  set_switches: 'Behaviour', set_postproc: 'Post-processing', set_notif: 'Notifications',
  set_security: 'Security', set_quota: 'Quota', set_advanced: 'Advanced',
  set_restart: 'Restart', set_shutdown: 'Shutdown', set_saved: 'Saved',
  pref_title: 'Preferences', pref_appearance: 'Appearance', pref_theme: 'Theme',
  pref_accent: 'Accent color', pref_language: 'Language', pref_branding: 'Branding',
  pref_app_name: 'Application name', pref_logo_url: 'Logo URL',
  pref_interface: 'Interface', pref_refresh: 'Refresh interval (ms)',
  pref_dash_jobs: 'Jobs on dashboard', pref_compact: 'Compact mode',
  pref_speed_unit: 'Speed unit', pref_notifications: 'Browser notifications',
  pref_notif_complete: 'Notify when job completes', pref_notif_fail: 'Notify on failure',
  pref_dark: 'Dark', pref_light: 'Light', pref_save: 'Save',
  pref_reset: 'Reset', pref_accent_cyan: 'Cyan', pref_accent_violet: 'Violet',
  pref_accent_green: 'Green', pref_accent_orange: 'Orange', pref_accent_rose: 'Rose',
  common_cancel: 'Cancel', common_confirm: 'Confirm', common_yes: 'Yes', common_no: 'No',
  common_loading: 'Loading...', common_error: 'Error', common_saved: 'Saved!',
  common_delete_confirm: 'Delete?', common_default: 'Default', common_none: 'None',
  common_apply: 'Apply',
}

const es: Translations = {
  nav_dashboard: 'Panel', nav_queue: 'Cola', nav_history: 'Historial',
  nav_servers: 'Servidores', nav_categories: 'Categorias', nav_schedule: 'Horario',
  nav_rss: 'RSS', nav_settings: 'Configuracion', nav_preferences: 'Preferencias',
  dash_title: 'Panel', dash_speed: 'Velocidad actual', dash_stats: 'Estadisticas',
  dash_storage: 'Almacenamiento', dash_remaining: 'Restante', dash_time_left: 'Tiempo restante',
  dash_free_space: 'Espacio libre', dash_jobs: 'Trabajos en cola', dash_global_progress: 'Progreso global',
  dash_queue: 'Cola', dash_see_all: 'Ver todo', dash_more_jobs: 'trabajo(s) mas',
  dash_limit: 'Limite', dash_cache: 'Cache', dash_download_folder: 'Descarga',
  dash_complete_folder: 'Completado', dash_add_nzb: 'Agregar NZB', dash_resume: 'Reanudar', dash_pause: 'Pausa',
  queue_title: 'Cola', queue_empty: 'Cola vacia', queue_pause_all: 'Pausar todo',
  queue_resume_all: 'Reanudar todo', queue_clear: 'Vaciar cola', queue_add: 'Agregar NZB',
  queue_files: 'Archivos', queue_rename: 'Renombrar', queue_delete: 'Eliminar',
  queue_move_up: 'Subir', queue_move_down: 'Bajar',
  queue_status_downloading: 'Descargando', queue_status_paused: 'En pausa', queue_status_queued: 'En espera',
  queue_remaining: 'restantes', queue_eta: 'ETA', queue_speed_limit: 'Limite de velocidad',
  hist_title: 'Historial', hist_entries: 'entradas', hist_search: 'Buscar...',
  hist_no_result: 'Sin resultados', hist_delete: 'Eliminar', hist_retry: 'Reintentar',
  hist_completed: 'Completado', hist_failed: 'Fallido',
  srv_title: 'Servidores', srv_add: 'Agregar servidor', srv_edit: 'Editar servidor',
  srv_delete: 'Eliminar', srv_test: 'Probar', srv_name: 'Nombre', srv_host: 'Host',
  srv_port: 'Puerto', srv_user: 'Usuario', srv_pass: 'Contrasena',
  srv_connections: 'Conexiones', srv_ssl: 'SSL/TLS', srv_active: 'Activo',
  srv_optional: 'Opcional (backup)', srv_retention: 'Retencion (dias, 0=ilimitado)',
  srv_timeout: 'Tiempo limite (s)', srv_priority: 'Prioridad', srv_save: 'Guardar',
  srv_test_ok: 'Conexion OK', srv_test_fail: 'Conexion fallida', srv_no_servers: 'No hay servidores configurados',
  srv_active_conn: 'conexion(es) activa(s)',
  cat_title: 'Categorias', cat_add: 'Nueva categoria', cat_edit: 'Editar categoria',
  cat_delete: 'Eliminar', cat_save: 'Guardar', cat_name: 'Nombre', cat_folder: 'Carpeta',
  cat_script: 'Script', cat_priority: 'Prioridad', cat_pp: 'Post-proceso', cat_none: 'Ninguno',
  set_title: 'Configuracion', set_general: 'General', set_folders: 'Carpetas',
  set_switches: 'Comportamiento', set_postproc: 'Post-proceso', set_notif: 'Notificaciones',
  set_security: 'Seguridad', set_quota: 'Cuota', set_advanced: 'Avanzado',
  set_restart: 'Reiniciar', set_shutdown: 'Apagar', set_saved: 'Guardado',
  pref_title: 'Preferencias', pref_appearance: 'Apariencia', pref_theme: 'Tema',
  pref_accent: 'Color de acento', pref_language: 'Idioma', pref_branding: 'Identidad',
  pref_app_name: 'Nombre de la aplicacion', pref_logo_url: 'URL del logo',
  pref_interface: 'Interfaz', pref_refresh: 'Intervalo de actualizacion (ms)',
  pref_dash_jobs: 'Trabajos en el panel', pref_compact: 'Modo compacto',
  pref_speed_unit: 'Unidad de velocidad', pref_notifications: 'Notificaciones del navegador',
  pref_notif_complete: 'Notificar cuando un trabajo termina', pref_notif_fail: 'Notificar en caso de error',
  pref_dark: 'Oscuro', pref_light: 'Claro', pref_save: 'Guardar',
  pref_reset: 'Restablecer', pref_accent_cyan: 'Cian', pref_accent_violet: 'Violeta',
  pref_accent_green: 'Verde', pref_accent_orange: 'Naranja', pref_accent_rose: 'Rosa',
  common_cancel: 'Cancelar', common_confirm: 'Confirmar', common_yes: 'Si', common_no: 'No',
  common_loading: 'Cargando...', common_error: 'Error', common_saved: 'Guardado!',
  common_delete_confirm: 'Eliminar?', common_default: 'Por defecto', common_none: 'Ninguno',
  common_apply: 'Aplicar',
}

const it: Translations = {
  nav_dashboard: 'Dashboard', nav_queue: 'Coda', nav_history: 'Cronologia',
  nav_servers: 'Server', nav_categories: 'Categorie', nav_schedule: 'Pianificazione',
  nav_rss: 'RSS', nav_settings: 'Impostazioni', nav_preferences: 'Preferenze',
  dash_title: 'Dashboard', dash_speed: 'Velocita attuale', dash_stats: 'Statistiche',
  dash_storage: 'Archiviazione', dash_remaining: 'Rimanente', dash_time_left: 'Tempo rimanente',
  dash_free_space: 'Spazio libero', dash_jobs: 'Job in coda', dash_global_progress: 'Progresso globale',
  dash_queue: 'Coda', dash_see_all: 'Vedi tutto', dash_more_jobs: 'job in piu',
  dash_limit: 'Limite', dash_cache: 'Cache', dash_download_folder: 'Download',
  dash_complete_folder: 'Completato', dash_add_nzb: 'Aggiungi NZB', dash_resume: 'Riprendi', dash_pause: 'Pausa',
  queue_title: 'Coda', queue_empty: 'Coda vuota', queue_pause_all: 'Pausa tutto',
  queue_resume_all: 'Riprendi tutto', queue_clear: 'Svuota coda', queue_add: 'Aggiungi NZB',
  queue_files: 'File', queue_rename: 'Rinomina', queue_delete: 'Elimina',
  queue_move_up: 'Su', queue_move_down: 'Giu',
  queue_status_downloading: 'Scaricando', queue_status_paused: 'In pausa', queue_status_queued: 'In attesa',
  queue_remaining: 'rimanenti', queue_eta: 'ETA', queue_speed_limit: 'Limite velocita',
  hist_title: 'Cronologia', hist_entries: 'voci', hist_search: 'Cerca...',
  hist_no_result: 'Nessun risultato', hist_delete: 'Elimina', hist_retry: 'Riprova',
  hist_completed: 'Completato', hist_failed: 'Fallito',
  srv_title: 'Server', srv_add: 'Aggiungi server', srv_edit: 'Modifica server',
  srv_delete: 'Elimina', srv_test: 'Testa', srv_name: 'Nome', srv_host: 'Host',
  srv_port: 'Porta', srv_user: 'Utente', srv_pass: 'Password',
  srv_connections: 'Connessioni', srv_ssl: 'SSL/TLS', srv_active: 'Attivo',
  srv_optional: 'Opzionale (backup)', srv_retention: 'Ritenzione (giorni, 0=illimitato)',
  srv_timeout: 'Timeout (s)', srv_priority: 'Priorita', srv_save: 'Salva',
  srv_test_ok: 'Connessione OK', srv_test_fail: 'Connessione fallita', srv_no_servers: 'Nessun server configurato',
  srv_active_conn: 'connessione/i attiva/e',
  cat_title: 'Categorie', cat_add: 'Nuova categoria', cat_edit: 'Modifica categoria',
  cat_delete: 'Elimina', cat_save: 'Salva', cat_name: 'Nome', cat_folder: 'Cartella',
  cat_script: 'Script', cat_priority: 'Priorita', cat_pp: 'Post-elaborazione', cat_none: 'Nessuno',
  set_title: 'Impostazioni', set_general: 'Generale', set_folders: 'Cartelle',
  set_switches: 'Comportamento', set_postproc: 'Post-elaborazione', set_notif: 'Notifiche',
  set_security: 'Sicurezza', set_quota: 'Quota', set_advanced: 'Avanzate',
  set_restart: 'Riavvia', set_shutdown: 'Spegni', set_saved: 'Salvato',
  pref_title: 'Preferenze', pref_appearance: 'Aspetto', pref_theme: 'Tema',
  pref_accent: 'Colore accento', pref_language: 'Lingua', pref_branding: 'Identita',
  pref_app_name: 'Nome applicazione', pref_logo_url: 'URL logo',
  pref_interface: 'Interfaccia', pref_refresh: 'Intervallo aggiornamento (ms)',
  pref_dash_jobs: 'Job nella dashboard', pref_compact: 'Modalita compatta',
  pref_speed_unit: 'Unita velocita', pref_notifications: 'Notifiche browser',
  pref_notif_complete: 'Notifica quando un job termina', pref_notif_fail: 'Notifica in caso di errore',
  pref_dark: 'Scuro', pref_light: 'Chiaro', pref_save: 'Salva',
  pref_reset: 'Ripristina', pref_accent_cyan: 'Ciano', pref_accent_violet: 'Viola',
  pref_accent_green: 'Verde', pref_accent_orange: 'Arancione', pref_accent_rose: 'Rosa',
  common_cancel: 'Annulla', common_confirm: 'Conferma', common_yes: 'Si', common_no: 'No',
  common_loading: 'Caricamento...', common_error: 'Errore', common_saved: 'Salvato!',
  common_delete_confirm: 'Eliminare?', common_default: 'Predefinito', common_none: 'Nessuno',
  common_apply: 'Applica',
}

const de: Translations = {
  nav_dashboard: 'Dashboard', nav_queue: 'Warteschlange', nav_history: 'Verlauf',
  nav_servers: 'Server', nav_categories: 'Kategorien', nav_schedule: 'Zeitplan',
  nav_rss: 'RSS', nav_settings: 'Einstellungen', nav_preferences: 'Oberflache',
  dash_title: 'Dashboard', dash_speed: 'Aktuelle Geschwindigkeit', dash_stats: 'Statistiken',
  dash_storage: 'Speicher', dash_remaining: 'Verbleibend', dash_time_left: 'Verbleibende Zeit',
  dash_free_space: 'Freier Speicher', dash_jobs: 'Jobs in Warteschlange', dash_global_progress: 'Gesamtfortschritt',
  dash_queue: 'Warteschlange', dash_see_all: 'Alle anzeigen', dash_more_jobs: 'weitere Job(s)',
  dash_limit: 'Limit', dash_cache: 'Cache', dash_download_folder: 'Download',
  dash_complete_folder: 'Abgeschlossen', dash_add_nzb: 'NZB hinzufugen', dash_resume: 'Fortsetzen', dash_pause: 'Pause',
  queue_title: 'Warteschlange', queue_empty: 'Warteschlange leer', queue_pause_all: 'Alle pausieren',
  queue_resume_all: 'Alle fortsetzen', queue_clear: 'Warteschlange leeren', queue_add: 'NZB hinzufugen',
  queue_files: 'Dateien', queue_rename: 'Umbenennen', queue_delete: 'Loschen',
  queue_move_up: 'Nach oben', queue_move_down: 'Nach unten',
  queue_status_downloading: 'Herunterladen', queue_status_paused: 'Pausiert', queue_status_queued: 'Wartend',
  queue_remaining: 'verbleibend', queue_eta: 'ETA', queue_speed_limit: 'Geschwindigkeitslimit',
  hist_title: 'Verlauf', hist_entries: 'Eintrage', hist_search: 'Suchen...',
  hist_no_result: 'Keine Ergebnisse', hist_delete: 'Loschen', hist_retry: 'Wiederholen',
  hist_completed: 'Abgeschlossen', hist_failed: 'Fehlgeschlagen',
  srv_title: 'Server', srv_add: 'Server hinzufugen', srv_edit: 'Server bearbeiten',
  srv_delete: 'Loschen', srv_test: 'Testen', srv_name: 'Name', srv_host: 'Host',
  srv_port: 'Port', srv_user: 'Benutzer', srv_pass: 'Passwort',
  srv_connections: 'Verbindungen', srv_ssl: 'SSL/TLS', srv_active: 'Aktiv',
  srv_optional: 'Optional (Backup)', srv_retention: 'Aufbewahrung (Tage, 0=unbegrenzt)',
  srv_timeout: 'Timeout (s)', srv_priority: 'Prioritat', srv_save: 'Speichern',
  srv_test_ok: 'Verbindung OK', srv_test_fail: 'Verbindung fehlgeschlagen', srv_no_servers: 'Keine Server konfiguriert',
  srv_active_conn: 'aktive Verbindung(en)',
  cat_title: 'Kategorien', cat_add: 'Neue Kategorie', cat_edit: 'Kategorie bearbeiten',
  cat_delete: 'Loschen', cat_save: 'Speichern', cat_name: 'Name', cat_folder: 'Ordner',
  cat_script: 'Skript', cat_priority: 'Prioritat', cat_pp: 'Nachbearbeitung', cat_none: 'Keine',
  set_title: 'Einstellungen', set_general: 'Allgemein', set_folders: 'Ordner',
  set_switches: 'Verhalten', set_postproc: 'Nachbearbeitung', set_notif: 'Benachrichtigungen',
  set_security: 'Sicherheit', set_quota: 'Kontingent', set_advanced: 'Erweitert',
  set_restart: 'Neu starten', set_shutdown: 'Herunterfahren', set_saved: 'Gespeichert',
  pref_title: 'Oberflache', pref_appearance: 'Erscheinungsbild', pref_theme: 'Thema',
  pref_accent: 'Akzentfarbe', pref_language: 'Sprache', pref_branding: 'Identitat',
  pref_app_name: 'Anwendungsname', pref_logo_url: 'Logo-URL',
  pref_interface: 'Oberflache', pref_refresh: 'Aktualisierungsintervall (ms)',
  pref_dash_jobs: 'Jobs im Dashboard', pref_compact: 'Kompakter Modus',
  pref_speed_unit: 'Geschwindigkeitseinheit', pref_notifications: 'Browser-Benachrichtigungen',
  pref_notif_complete: 'Benachrichtigen wenn Job fertig', pref_notif_fail: 'Benachrichtigen bei Fehler',
  pref_dark: 'Dunkel', pref_light: 'Hell', pref_save: 'Speichern',
  pref_reset: 'Zurucksetzen', pref_accent_cyan: 'Cyan', pref_accent_violet: 'Violett',
  pref_accent_green: 'Grun', pref_accent_orange: 'Orange', pref_accent_rose: 'Rosa',
  common_cancel: 'Abbrechen', common_confirm: 'Bestatigen', common_yes: 'Ja', common_no: 'Nein',
  common_loading: 'Laden...', common_error: 'Fehler', common_saved: 'Gespeichert!',
  common_delete_confirm: 'Loschen?', common_default: 'Standard', common_none: 'Keine',
  common_apply: 'Anwenden',
}

export const translations: Record<Lang, Translations> = { fr, en, es, it, de }

export const LANG_LABELS: Record<Lang, string> = {
  fr: 'Francais', en: 'English', es: 'Espanol', it: 'Italiano', de: 'Deutsch'
}
