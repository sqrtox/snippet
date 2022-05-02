from random import randint

print('数を当ててごらん')

secret_number = randint(1, 100)

print(f'秘密の数字：{secret_number}')

while True:
    print('ほら、予想を入力してね')

    try:
        guess = int(input())

        print(f'あなたの予想：{guess}')

        if guess < secret_number:
            print('小さすぎ！')

        elif guess > secret_number:
            print('大きすぎ！')

        else:
            print('やったね！')

            break

    except ValueError:
        print('整数を入力してください！')
