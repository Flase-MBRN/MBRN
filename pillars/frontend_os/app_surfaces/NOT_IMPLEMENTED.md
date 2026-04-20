# /pillars/frontend_os/app_surfaces/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Zentrale App-Oberflächen-Komposition und App-Container-Management.

- Dynamisches Laden von App-Komponenten
- App-Lifecycle-Management (Mount/Unmount)
- Inter-App-Kommunikation
- App-spezifische State-Isolierung

## Warum leer?

YAGNI-Prinzip: Aktuell rendern sich Apps selbstständig über `apps/*/index.html` und `dimensions/*/apps/`. 

Die komplexe App-Container-Infrastruktur ist erst bei Bedarf relevant:
- Wenn Apps dynamisch nachgeladen werden müssen (nicht statisch)
- Wenn Micro-Frontend-Architektur benötigt wird
- Wenn Apps aus externen Quellen (CDN, Module) geladen werden

## Wann implementiert?

Trigger-Bedingungen:
- Nach Phase 5 (Restbereinigung) wenn App-Architektur stabil ist
- Wenn dynamisches App-Loading mit Lazy-Loading notwendig wird
- Wenn App-Isolation (Sandboxing) erforderlich ist

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige App-Container-Funktionalität. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
