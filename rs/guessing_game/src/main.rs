use rand::Rng;
use std::cmp::Ordering;
use std::io;

fn main() {
    println!("数を当ててごらん");

    let secret_number = rand::thread_rng().gen_range(1..101);

    println!("秘密の数字：{}", secret_number);

    loop {
        println!("ほら、予想を入力してね");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("読み込みに失敗しました");

        let guess: u32 = guess.trim().parse().expect("数字を入力してください！");
        println!("あなたの予想：{}", guess);

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("小さすぎ！"),
            Ordering::Greater => println!("大きすぎ！"),
            Ordering::Equal => {
                println!("やったね！");

                break;
            }
        }
    }
}
