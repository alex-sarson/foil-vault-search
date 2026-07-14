# Optional SQL dump

Place a SQLite dump at `data/cards.sql` to skip downloading Scryfall bulk data on first boot.

Boot order in `apps/api`:

1. Use existing `apps/api/data/cards.db` if it already has cards
2. Else restore from `data/cards.sql` (or `apps/api/data/cards.sql`) if present
3. Else download Scryfall oracle-cards, shred into SQLite, and write a dump for next time

Do not commit large dumps or `.db` files by default.
