puts '数を当ててごらん'

secret_number = rand(99) + 1

puts "秘密の数字：#{secret_number}"

while true
    puts 'ほら、予想を入力してね'

    guess = gets.to_i

    puts "あなたの予想：#{guess}"

    if guess < secret_number
        puts '小さすぎ！'
    
    elsif guess > secret_number
        puts '大きすぎ！'

    else
        puts 'やったね！'

        break

    end
end