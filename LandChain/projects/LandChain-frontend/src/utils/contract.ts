import * as algosdk from 'algosdk';

// Gunakan AlgoNode TestNet yang lebih reliable
const algodClient = new algosdk.Algodv2(
    '', // No token needed for AlgoNode
    'https://testnet-api.algonode.cloud',
    '' // No port needed
);

// Konfigurasi contract
export const CONTRACT_CONFIG = {
    appId: 748980130, // Pastikan ini adalah App ID terbaru Anda
    appAddress: 'ATWWD3WRF5T4R4WM6RRXGOVV34I44CTRRO3BTDPPL5HJ7WP4EYD72RAKOM',
};

// Method signatures Anda (diambil dari .py)
const methodSignatures = {
    "register_tanah": "register_tanah(string,string,string,string)string",
    "buat_sertifikat": "buat_sertifikat(string)string",
    "verifikasi_tanah": "verifikasi_tanah()string",
    "pindah_kepemilikan": "pindah_kepemilikan(string)string",
    "get_info_tanah": "get_info_tanah()string"
};

// Test koneksi
export async function testNetworkConnection(): Promise<boolean> {
    try {
        const status = await algodClient.status().do();
        console.log('✅ Network connected:', status);
        return true;
    } catch (error) {
        console.error('❌ Network connection failed:', error);
        return false;
    }
}

export interface TanahData {
    tanah_id: string;
    pemilik: string;
    luas: string;
    lokasi: string;
    nomor_sertifikat: string;
    status_verifikasi: number;
}

/**
 * Membaca state global dari contract
 */
export async function readContractGlobalState(): Promise<Partial<TanahData>> {
    try {
        console.log('🔍 Reading contract state for App ID:', CONTRACT_CONFIG.appId);
        const appInfo = await algodClient.getApplicationByID(CONTRACT_CONFIG.appId).do();
        const globalState = appInfo.params.globalState || [];
        const state: Partial<TanahData> = {};

        globalState.forEach((item: any) => {
            const key = Buffer.from(item.key, 'base64').toString('utf-8');
            const value = item.value;
            switch (key) {
                case 'pemilik':
                    state.pemilik = value.bytes ? Buffer.from(value.bytes, 'base64').toString('utf-8') : value.uint?.toString() || '';
                    break;
                case 'luas':
                    state.luas = value.bytes ? Buffer.from(value.bytes, 'base64').toString('utf-8') : value.uint?.toString() || '';
                    break;
                case 'lokasi':
                    state.lokasi = value.bytes ? Buffer.from(value.bytes, 'base64').toString('utf-8') : '';
                    break;
                case 'nomor_sertifikat':
                    state.nomor_sertifikat = value.bytes ? Buffer.from(value.bytes, 'base64').toString('utf-8') : '';
                    break;
                case 'status_verifikasi':
                    state.status_verifikasi = value.uint ? Number(value.uint) : 0;
                    break;
                case 'tanah_id':
                    state.tanah_id = value.bytes ? Buffer.from(value.bytes, 'base64').toString('utf-8') : value.uint?.toString() || '';
                    break;
                default:
                    if (!key.startsWith('_')) {
                        console.log('Unknown global state key:', key, value);
                    }
            }
        });
        console.log('✅ Parsed state:', state);
        return state;
    } catch (error) {
        console.error('❌ Error reading contract global state:', error);
        throw error;
    }
}

/**
 * 💡 DIPERBARUI: Membuat transaction ABI-compliant (tapi mentah/unsigned)
 */
export async function createMethodCallTxn(
    sender: string,
    methodName: string, // e.g., "register_tanah"
    args: (string | number | bigint)[] = [] // e.g., ["TNH-001", "User A", ...]
): Promise<algosdk.Transaction> {
    console.log(`🔍 [DEBUG] Creating ABI Call for method: ${methodName}`);

    if (!sender) {
        throw new Error('Invalid sender address');
    }

    // @ts-ignore
    const signature = methodSignatures[methodName];
    if (!signature) {
        throw new Error(`Method signature for "${methodName}" not found.`);
    }

    const suggestedParams = await algodClient.getTransactionParams().do();

    // 1. Buat method object dari signature
    const method = algosdk.ABIMethod.fromSignature(signature);

    // 2. Dapatkan 4-byte selector
    const selector = method.getSelector();

    // 3. ✅ PERBAIKAN: Gunakan 'ABIType' untuk encode, bukan 'ABIEncoder'
    const encodedArgs = args.map((arg, index) => {
        // Ambil string tipe data (e.g., "string")
        const typeString = method.args[index].type.toString();

        // Buat Tipe ABI dari string tersebut
        const abiType = algosdk.ABIType.from(typeString);

        // Encode argumen mentah menggunakan tipe tersebut
        return abiType.encode(arg);
    });

    // 4. Buat transaksi mentah
    const tx = algosdk.makeApplicationCallTxnFromObject({
        sender: sender,
        appIndex: CONTRACT_CONFIG.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: suggestedParams,
        appArgs: [
            selector,       // <-- Argumen pertama adalah 4-byte selector
            ...encodedArgs  // <-- Sisanya adalah argumen yang sudah di-encode
        ],
        note: new TextEncoder().encode(`LandChain:${methodName}`),
    });

    console.log('✅ ABI Application Call transaction created successfully');
    return tx;
}


/**
 * Mendapatkan informasi tanah (client-side)
 */
export async function getInfoTanah(): Promise<string> {
    try {
        const state = await readContractGlobalState();
        const info = `Informasi Tanah:
ID: ${state.tanah_id || '-'}
Pemilik: ${state.pemilik || '-'}
Luas: ${state.luas || '-'}
Lokasi: ${state.lokasi || '-'}
Sertifikat: ${state.nomor_sertifikat || 'Belum ada'}
Status: ${state.status_verifikasi === 1 ? 'Terverifikasi' : 'Belum Terverifikasi'}`;
        return info;
    } catch (error) {
        console.error('Error getting tanah info:', error);
        return 'Gagal memuat informasi tanah dari smart contract';
    }
}

/**
 * Test koneksi ke contract
 */
export async function testContractConnection(): Promise<boolean> {
    try {
        const state = await readContractGlobalState();
        console.log('Contract global state:', state);
        return true;
    } catch (error) {
        console.error('Failed to connect to contract:', error);
        return false;
    }
}

// Ekspor fungsi-fungsi yang dibutuhkan oleh Home.tsx
export default {
    readContractGlobalState,
    getInfoTanah,
    testNetworkConnection,
    testContractConnection,
    CONTRACT_CONFIG
};