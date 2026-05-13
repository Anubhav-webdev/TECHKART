## TODO - Fix add-to-cart and signup/login password issues

- [ ] Update `E-frontend/src/context/CartContext.jsx` to improve add-to-cart error surfacing and ensure reserve failures show meaningful messages.
- [ ] Update `E-frontend/src/MainComponents/addCartButton.jsx` to avoid blocking “Add to Cart” when stock value is unreliable; allow backend reserve to determine sold-out state.
- [ ] Update `Backend/server/routes/authRoutes.js` to normalize identifier correctly during user login (use normalized `id` when querying by username/email/phone).
- [ ] Run frontend/backend to verify:
  - Signup → login with correct password succeeds.
  - Add to cart reserves stock and cart UI updates; sold-out shows proper popup.

