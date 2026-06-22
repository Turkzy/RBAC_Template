export const setAuthCookie = (res, token) => {
    const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === "production";
    res.cookie('token', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
    });
};

export const clearAuthCookie = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        path: '/',
    });
};