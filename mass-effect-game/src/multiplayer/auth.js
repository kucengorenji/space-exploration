/* ===================================================================
   FIREBASE AUTHENTICATION, GOOGLE SSO & CLOUD DOSSIER SYNC ENGINE
   Enforces domain restriction: @frisseblikken.com, @fresh-forces.com, @gmail.com
   Syncs user progress (credits, cargo, upgrades, fleet) with Firestore users/{uid}
   =================================================================== */

import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, googleProvider, db } from "./firebase.js";
import { GAME_CONFIG } from "./config.js";
import { gameState } from "../core/state.js";

/** Validates whether an email belongs to authorized organization domains */
export function isDomainAllowed(email) {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return GAME_CONFIG.auth.allowedDomains.includes(domain);
}

/** Saves current gameState progress (credits, cargo, upgrades, fleet) to Firestore users/{uid} */
export async function saveUserProgressToCloud(user) {
    const targetUser = user || auth.currentUser;
    if (!targetUser || !targetUser.uid || !isDomainAllowed(targetUser.email)) return;

    try {
        const state = gameState.getState();
        const userRef = doc(db, 'users', targetUser.uid);
        await setDoc(userRef, {
            uid: targetUser.uid,
            displayName: targetUser.displayName || 'Commander',
            email: targetUser.email,
            photoURL: targetUser.photoURL || '',
            credits: state.credits,
            cargo: state.cargo,
            vehicleUpgrades: state.vehicleUpgrades,
            shipType: state.shipType,
            surfaceVehicleType: state.surfaceVehicleType,
            lastSaved: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('[Firestore] Progress Cloud Sync warning:', err);
    }
}

/** Loads saved progress from Firestore users/{uid} into gameState */
export async function loadUserProgressFromCloud(user) {
    if (!user || !user.uid || !isDomainAllowed(user.email)) return;

    try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
            const data = snap.data();
            gameState.loadDossier(data);
            gameState.addToast(`Cloud Dossier Loaded for Commander ${user.displayName?.split(' ')[0] || 'Pilot'}!`, 'success');
        } else {
            // First time login - save initial starter dossier
            await saveUserProgressToCloud(user);
            gameState.addToast(`New Alliance Dossier Created for ${user.displayName}!`, 'success');
        }
    } catch (err) {
        console.warn('[Firestore] Failed to load Cloud dossier:', err);
    }
}

/** Initiates Google SSO Login and validates domain restriction */
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!isDomainAllowed(user.email)) {
            await signOut(auth);
            gameState.addToast(
                `Access Denied! Domain not authorized (${user.email}).`,
                'warning'
            );
            return { success: false, error: 'Unauthorized domain' };
        }

        // Auto load user progress from Firestore
        await loadUserProgressFromCloud(user);

        gameState.addToast(`Access Granted! Welcome, Commander ${user.displayName}.`, 'success');
        return { success: true, user };
    } catch (err) {
        console.error('Google SSO Error:', err);
        let errorMsg = err.message;
        if (err.code === 'auth/unauthorized-domain') {
            errorMsg = 'This domain/origin is not authorized in Firebase Console -> Auth -> Settings -> Authorized Domains.';
        } else if (err.code === 'auth/popup-closed-by-user') {
            errorMsg = 'Sign-in popup window was closed before completing.';
        }
        gameState.addToast(`Login notice: ${errorMsg}`, 'warning');
        return { success: false, error: errorMsg };
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
    return onAuthStateChanged(auth, async (user) => {
        if (user && isDomainAllowed(user.email)) {
            await loadUserProgressFromCloud(user);
            callback(user);
        } else {
            callback(null);
        }
    });
}

// Auto sync progress to cloud when state mutates (credits, cargo, upgrades)
gameState.subscribe(() => {
    if (auth.currentUser) {
        saveUserProgressToCloud(auth.currentUser);
    }
});
