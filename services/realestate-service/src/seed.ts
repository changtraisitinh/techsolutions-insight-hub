import { query } from './db';

async function seed() {
    try {
        console.log('🔌 Connecting to database...');
        // Enable unaccent extension
        await query('CREATE EXTENSION IF NOT EXISTS unaccent');
        console.log('✅ Extension unaccent enabled');

        // Data for ID 35643
        const rec1 = {
            id: 35643,
            thongtinchung: {
                mathuadat: '268360570008',
                soto: '57',
                sothua: '8',
                dientich: 737.6,
                maphuongxa: '26836',
                tenphuongxa: 'Phường Tân Phú',
                tenquanhuyen: 'Quận 9',
                dsttdoan: [
                    {
                        soqd: '1028/QĐ-UBND',
                        tendoan: 'Đồ án điều chỉnh quy hoạch chi tiết Khu công nghệ cao Thành phố Hồ Chí Minh (giai đoạn 1), Quận 9',
                        ngayduyet: '16/03/2007',
                        coquanpd: 'UBND Thành phố Hồ Chí Minh'
                    }
                ],
                marker: {
                    coordinates: [106.794408234288, 10.855246144359]
                }
            },
            logioi: []
        };

        // Data for ID 35649
        const rec2 = {
            id: 35649,
            thongtinchung: {
                mathuadat: '268360570009',
                soto: '57',
                sothua: '9',
                dientich: 1397.6,
                maphuongxa: '26836',
                tenphuongxa: 'Phường Tân Phú',
                tenquanhuyen: 'Quận 9',
                dsttdoan: [
                    {
                        soqd: '1028/QĐ-UBND',
                        tendoan: 'Đồ án điều chỉnh quy hoạch chi tiết Khu công nghệ cao Thành phố Hồ Chí Minh (giai đoạn 1), Quận 9',
                        ngayduyet: '16/03/2007',
                        coquanpd: 'UBND Thành phố Hồ Chí Minh'
                    }
                ],
                marker: {
                    coordinates: [106.794209369846, 10.8550010673196]
                }
            },
            logioi: []
        };

        console.log('🗑️ Cleaning old data for IDs 35643, 35649...');
        await query('DELETE FROM public.ttqh_chi_tiet WHERE id IN ($1, $2)', [35643, 35649]);

        console.log('🌱 Inserting new data...');
        const insertSQL = 'INSERT INTO public.ttqh_chi_tiet (id, thongtinchung, logioi) VALUES ($1, $2, $3)';

        await query(insertSQL, [rec1.id, rec1.thongtinchung, rec1.logioi]);
        await query(insertSQL, [rec2.id, rec2.thongtinchung, rec2.logioi]);

        console.log('✅ Seed complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seed();
