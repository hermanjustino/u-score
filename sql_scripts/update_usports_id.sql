-- Script to add U Sports IDs to teams table
-- Created: March 2025

-- First make sure the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'usports_id'
    ) THEN
        ALTER TABLE teams ADD COLUMN usports_id VARCHAR(32);
    END IF;
END
$$;

-- Add a lookup column for mapping (temporary)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'lookup_key'
    ) THEN
        ALTER TABLE teams ADD COLUMN lookup_key VARCHAR(50);
    END IF;
END
$$;

-- Update the lookup keys - converting spaces and special chars to match JSON file format
UPDATE teams
SET lookup_key = LOWER(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(short_name, ' ', ''),
                        '.', ''),
                    ',', ''),
                '\', ''),
            '-', ''),
        'university', '')
    );

-- Update men's teams
UPDATE teams
SET usports_id = CASE
    WHEN lookup_key = 'acadia' AND gender = 'men' THEN 'y8yj0hcukqaoj6x5'
    WHEN lookup_key = 'alberta' AND gender = 'men' THEN 'q75v7cu1qyar525b'
    WHEN lookup_key = 'algoma' AND gender = 'men' THEN 'nydlqtgbdd3hyzc8'
    WHEN lookup_key = 'bishops' AND gender = 'men' THEN 'qcs7pz9glidqf06w'
    WHEN lookup_key = 'brandon' AND gender = 'men' THEN 'b6e7g4ys0ktp1aow'
    WHEN lookup_key = 'brock' AND gender = 'men' THEN 'w5jeddtyr3xxyzl7'
    WHEN lookup_key = 'calgary' AND gender = 'men' THEN 'zm8bb5oopezcxkkc'
    WHEN lookup_key = 'capebreton' AND gender = 'men' THEN 'jzwvtlajamp707w3'
    WHEN lookup_key = 'carleton' AND gender = 'men' THEN 'r30x3rx4fu1odi2p'
    WHEN lookup_key = 'concordia' AND gender = 'men' THEN '0k4i0ccei523vlm3'
    WHEN lookup_key = 'dalhousie' AND gender = 'men' THEN 'dqm6sqc3xctwt4h1'
    WHEN lookup_key = 'guelph' AND gender = 'men' THEN 'xzz0nj6picjmclme'
    WHEN lookup_key = 'lakehead' AND gender = 'men' THEN 'saqxfdlaocfw0xkp'
    WHEN lookup_key = 'laurentian' AND gender = 'men' THEN '0gqe1ytdqpzszay7'
    WHEN lookup_key = 'laurier' AND gender = 'men' THEN 'hkmqhghu9tqk834o'
    WHEN lookup_key = 'laval' AND gender = 'men' THEN 'uv1rw1dzqely29yh'
    WHEN lookup_key = 'lethbridge' AND gender = 'men' THEN 'dspprpwjotoy5obv'
    WHEN lookup_key = 'macewan' AND gender = 'men' THEN '9ptg3yvb4jjvfgdz'
    WHEN lookup_key = 'manitoba' AND gender = 'men' THEN 'kzw69txjxc1gnyv1'
    WHEN lookup_key = 'mcgill' AND gender = 'men' THEN '0c9on6rrtwrilkur'
    WHEN lookup_key = 'mcmaster' AND gender = 'men' THEN '121xknt675mbylz6'
    WHEN lookup_key = 'memorial' AND gender = 'men' THEN 'aitjdik6l0tgyqkw'
    WHEN lookup_key = 'mountroyal' AND gender = 'men' THEN '7kugnfckzhr9qep2'
    WHEN lookup_key = 'nipissing' AND gender = 'men' THEN 'ffqyi4a9hgisive3'
    WHEN lookup_key = 'ontariotech' AND gender = 'men' THEN 'lg428aa3fp9qjuge'
    WHEN lookup_key = 'ottawa' AND gender = 'men' THEN '7phws5v01eksuipa'
    WHEN lookup_key = 'queens' AND gender = 'men' THEN 'ljeqodc1maqg14nr'
    WHEN lookup_key = 'regina' AND gender = 'men' THEN '980lafmggn4pux16'
    WHEN lookup_key = 'saintmarys' AND gender = 'men' THEN '8j6csvfgsvybr73w'
    WHEN lookup_key = 'saskatchewan' AND gender = 'men' THEN '4tpmyvhznjxrvq4i'
    WHEN lookup_key = 'stfx' AND gender = 'men' THEN 'u2hxywj1qwvphyfj'
    WHEN lookup_key = 'thompsonrivers' AND gender = 'men' THEN 't3kja5c6kg1l7k37'
    WHEN lookup_key = 'toronto' AND gender = 'men' THEN '8f877em4xltgfk1k'
    WHEN lookup_key = 'torontometropolitan' AND gender = 'men' THEN 'f74r5mu338w589qb'
    WHEN lookup_key = 'trinitywestern' AND gender = 'men' THEN 'paqvtlbxgu1vtje5'
    WHEN lookup_key = 'ubc' AND gender = 'men' THEN 'rbm4zkr1x9m6ukj9'
    WHEN lookup_key = 'ubcokanagan' AND gender = 'men' THEN 'chamh364n48hfii5'
    WHEN lookup_key = 'ufv' AND gender = 'men' THEN 'o8666guc3uds2u5o'
    WHEN lookup_key = 'unb' AND gender = 'men' THEN 'm369vdns1f3t56p6'
    WHEN lookup_key = 'unbc' AND gender = 'men' THEN 'htwrf7d5zc43gczv'
    WHEN lookup_key = 'upei' AND gender = 'men' THEN 's0wpxor7o0x8hxf8'
    WHEN lookup_key = 'uqam' AND gender = 'men' THEN 'f8owo1rc72wi0s5s'
    WHEN lookup_key = 'victoria' AND gender = 'men' THEN 'e323vdchcustu2v8'
    WHEN lookup_key = 'waterloo' AND gender = 'men' THEN '2i51250sg10gejh4'
    WHEN lookup_key = 'western' AND gender = 'men' THEN 'e9lefqoftnwjg6s8'
    WHEN lookup_key = 'windsor' AND gender = 'men' THEN 'kesar8tkp5tkrkai'
    WHEN lookup_key = 'winnipeg' AND gender = 'men' THEN 'ho1wbw648p0me942'
    WHEN lookup_key = 'york' AND gender = 'men' THEN 'te8p1xqb6b8z61y0'
    ELSE usports_id
END
WHERE gender = 'men';

-- Update women's teams
UPDATE teams
SET usports_id = CASE
    WHEN lookup_key = 'acadia' AND gender = 'women' THEN '2mj9xdcqh5wdyvl0'
    WHEN lookup_key = 'alberta' AND gender = 'women' THEN 'q2waookgdi0wy1zz'
    WHEN lookup_key = 'algoma' AND gender = 'women' THEN '7ehk0i4z63v6z941'
    WHEN lookup_key = 'bishops' AND gender = 'women' THEN '4lnd4qf0ugx92g97'
    WHEN lookup_key = 'brandon' AND gender = 'women' THEN 'sy750c3ys0z37qu7'
    WHEN lookup_key = 'brock' AND gender = 'women' THEN 'ptan9haux9ek0bfa'
    WHEN lookup_key = 'calgary' AND gender = 'women' THEN 'ggjc37zojrrq2xlk'
    WHEN lookup_key = 'capebreton' AND gender = 'women' THEN '6rdmlp2nm8a4qveq'
    WHEN lookup_key = 'carleton' AND gender = 'women' THEN 'gy65iexl6skc8mle'
    WHEN lookup_key = 'concordia' AND gender = 'women' THEN 'yug3t78rw15djdec'
    WHEN lookup_key = 'dalhousie' AND gender = 'women' THEN 'zcu5upaqi7wvks9x'
    WHEN lookup_key = 'guelph' AND gender = 'women' THEN 'ta31nc9bfa4100mu'
    WHEN lookup_key = 'lakehead' AND gender = 'women' THEN 'mg2s0kbhfync2ezv'
    WHEN lookup_key = 'laurentian' AND gender = 'women' THEN 'o8v0ir65lh3s53fc'
    WHEN lookup_key = 'laurier' AND gender = 'women' THEN '7kqc4svkngn6isv4'
    WHEN lookup_key = 'laval' AND gender = 'women' THEN '277pry5k1j7vkzoh'
    WHEN lookup_key = 'lethbridge' AND gender = 'women' THEN 'oefehd3vbjgtvrwx'
    WHEN lookup_key = 'macewan' AND gender = 'women' THEN 'fnff0kxbozkax98t'
    WHEN lookup_key = 'manitoba' AND gender = 'women' THEN 'ih3vxvf9oh6vrn97'
    WHEN lookup_key = 'mcgill' AND gender = 'women' THEN 'em67om5k68swayge'
    WHEN lookup_key = 'mcmaster' AND gender = 'women' THEN 'f5hs454x3feu7ztc'
    WHEN lookup_key = 'memorial' AND gender = 'women' THEN 'po1wuxono9prihgq'
    WHEN lookup_key = 'mountroyal' AND gender = 'women' THEN '862vg43mglie85p9'
    WHEN lookup_key = 'nipissing' AND gender = 'women' THEN 'r97a0d05a6z6kig9'
    WHEN lookup_key = 'ontariotech' AND gender = 'women' THEN 'ykndmcn4v2g78cs8'
    WHEN lookup_key = 'ottawa' AND gender = 'women' THEN 'hy6btjl3qc8c5yva'
    WHEN lookup_key = 'queens' AND gender = 'women' THEN 'rrj2784hwzfr7aza'
    WHEN lookup_key = 'regina' AND gender = 'women' THEN '0q3vm2nbd265vlie'
    WHEN lookup_key = 'saintmarys' AND gender = 'women' THEN 'uye0i9dglkwkcn9r'
    WHEN lookup_key = 'saskatchewan' AND gender = 'women' THEN 'freypcg6mf64t2re'
    WHEN lookup_key = 'stfx' AND gender = 'women' THEN 'uycr0bweapb1xit3'
    WHEN lookup_key = 'thompsonrivers' AND gender = 'women' THEN 'qigajy4sv76q3zwz'
    WHEN lookup_key = 'toronto' AND gender = 'women' THEN '8bsbd66tbacw8x2j'
    WHEN lookup_key = 'torontometropolitan' AND gender = 'women' THEN 'gxo48penxkjmg7gh'
    WHEN lookup_key = 'trinitywestern' AND gender = 'women' THEN 'gfpeob1a6bk2gqld'
    WHEN lookup_key = 'ubc' AND gender = 'women' THEN 'bapuukdeb6tv7fzf'
    WHEN lookup_key = 'ubcokanagan' AND gender = 'women' THEN 'i3r9fi4sofozszgb'
    WHEN lookup_key = 'ufv' AND gender = 'women' THEN '0398h8bmyi1flyzi'
    WHEN lookup_key = 'unb' AND gender = 'women' THEN 'e5p36ysx1nsez37k'
    WHEN lookup_key = 'unbc' AND gender = 'women' THEN 'dovvvj1na26jvg8f'
    WHEN lookup_key = 'upei' AND gender = 'women' THEN 'p3vd6mj8muwl7yhp'
    WHEN lookup_key = 'uqam' AND gender = 'women' THEN 'sogpkhoidwhbdpk2'
    WHEN lookup_key = 'victoria' AND gender = 'women' THEN 'vfur4hy4xye2ghcs'
    WHEN lookup_key = 'waterloo' AND gender = 'women' THEN 'y6fwnqi40ylorvws'
    WHEN lookup_key = 'western' AND gender = 'women' THEN '5k22v34yhpj5o8nl'
    WHEN lookup_key = 'windsor' AND gender = 'women' THEN '34x6f6vc98xrzu5t'
    WHEN lookup_key = 'winnipeg' AND gender = 'women' THEN 'uyci5hafb5mlehpk'
    WHEN lookup_key = 'york' AND gender = 'women' THEN 'yjq9iiawt23ydoov'
    ELSE usports_id
END
WHERE gender = 'women';

-- Remove the temporary lookup column
ALTER TABLE teams DROP COLUMN IF EXISTS lookup_key;

-- Check which teams are missing U Sports IDs after the update
SELECT id, university, gender, short_name, usports_id
FROM teams 
WHERE usports_id IS NULL
ORDER BY gender, university;

-- Show all U Sports IDs that were updated
SELECT id, university, gender, short_name, usports_id
FROM teams 
WHERE usports_id IS NOT NULL
ORDER BY gender, university;