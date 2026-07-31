/* ===================================================================
   FIREBASE AUTHENTICATION & GOOGLE SSO DOMAIN VALIDATOR
   Enforces domain restriction: @frisseblikken.com and @fresh-forces.com
   =================================================================== */

import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth, googleProvider } from "./firebase.js";
import { GAME_CONFIG } from "./config.js";
import { gameState } from "../core/state.js";

/** Validates whether an email belongs to the authorized organization domains */
export function isDomainAllowed(email) {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return GAME_CONFIG.auth.allowedDomains.includes(domain);
}

/** Initiates Google SSO Login and validates domain restriction */
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!isDomainAllowed(user.email)) {
            await signOut(auth);
            gameState.addToast(
                `Access Denied! Email domain not authorized (${user.email}). Only @frisseblikken.com and @fresh-forces.com allowed.`,
                'warning'
            );
            return { success: false, error: 'Unauthorized domain' };
        }

        gameState.addToast(`Welcome back Commander, ${user.displayName}! Access Granted.`, 'success');
        return { success: true, user };
    } catch (err) {
        console.error('Google SSO Error:', err);
        gameState.addToast(`Login failed: ${err.message}`, 'warning');
        return { success: false, error: err.message };
    }
}

/** Signs out current user session */
export async function logoutUser() {
    try {
        await signOut(auth);
        gameState.addToast('Logged out from Alliance Command.', 'info');
    } catch (err) {
        console.error('Logout Error:', err);
    }
}

/** Attaches listener for auth state changes */
export function subscribeAuthState(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user && isDomainAllowed(user.email)) {
            callback(user);
        } else {
            callback(null);
        }
    });
}
